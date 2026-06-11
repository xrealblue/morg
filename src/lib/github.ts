import { db } from "~/server/db";
import { Octokit } from "octokit";
import { aiSummarize } from "./gemini";
import { fetchCommitFromGitHub, storeCommitDiff } from "./github-commit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface CommitData {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
}

function parseGithubUrl(githubUrl: string) {
  const urlParts = githubUrl.replace(/\/+$/, "").split("/");
  const repo = urlParts[urlParts.length - 1];
  const owner = urlParts[urlParts.length - 2];

  if (!owner || !repo) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }

  return { owner, repo };
}

export async function getCommits(
  githubUrl: string,
  page = 1,
  perPage = 30,
): Promise<CommitData[]> {
  const { owner, repo } = parseGithubUrl(githubUrl);

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    page,
    per_page: perPage,
  });

  return data
    .sort((a, b) => {
      const dateA = a.commit.author?.date ?? "";
      const dateB = b.commit.author?.date ?? "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .map((commit) => ({
      commitHash: commit.sha,
      commitMessage: commit.commit.message,
      commitAuthorName: commit.commit.author?.name ?? "Unknown",
      commitAuthorAvatar: commit.author?.avatar_url ?? "",
      commitDate: commit.commit.author?.date ?? new Date().toISOString(),
    }));
}

export async function pollCommits(projectId: string, page = 1) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project GitHub URL not found");
  }

  const { owner, repo } = parseGithubUrl(project.githubUrl);
  const commitHashes = await getCommits(project.githubUrl, page);
  const unprocessed = await filterUnprocessedCommits(projectId, commitHashes);

  if (unprocessed.length === 0) return;

  for (const commit of unprocessed) {
    try {
      const detail = await fetchCommitFromGitHub(owner, repo, commit.commitHash);

      const diff = await fetch(`${project.githubUrl}/commit/${commit.commitHash}.diff`, {
        headers: { Accept: "application/vnd.github.v3.diff" },
      });
      const diffText = diff.ok ? await diff.text() : "";
      const summary = (await aiSummarize(diffText)) ?? "No summary available";

      await storeCommitDiff(projectId, commit.commitHash, {
        ...detail,
        commitMessage: commit.commitMessage,
        commitAuthorName: commit.commitAuthorName,
        commitAuthorAvatar: commit.commitAuthorAvatar,
        commitDate: commit.commitDate,
      });

      const dbCommit = await db.commit.findFirst({
        where: { projectId, commitHash: commit.commitHash },
      });
      if (dbCommit) {
        await db.commit.update({
          where: { id: dbCommit.id },
          data: { summary },
        });
      }
    } catch (err) {
      console.error(`Failed to process commit ${commit.commitHash}:`, err);
    }
  }
}

async function filterUnprocessedCommits(
  projectId: string,
  commits: CommitData[],
): Promise<CommitData[]> {
  const existing = await db.commit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });

  const existingHashes = new Set(existing.map((c) => c.commitHash));
  return commits.filter((c) => !existingHashes.has(c.commitHash));
}
