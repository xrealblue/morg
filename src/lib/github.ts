import { db } from "~/server/db";
import { Octokit } from "octokit";
import { aiSummarize } from "./gemini";

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

  const commitHashes = await getCommits(project.githubUrl, page);
  const unprocessed = await filterUnprocessedCommits(projectId, commitHashes);

  if (unprocessed.length === 0) return;

  const summaryResults = await Promise.allSettled(
    unprocessed.map((commit) =>
      summarizeCommit(project.githubUrl, commit.commitHash),
    ),
  );

  const summaries = summaryResults.map((result) =>
    result.status === "fulfilled" ? result.value : "No summary available",
  );

  return db.commit.createMany({
    data: summaries.map((summary, index) => ({
      projectId,
      commitHash: unprocessed[index]!.commitHash,
      commitMessage: unprocessed[index]!.commitMessage,
      commitAuthorName: unprocessed[index]!.commitAuthorName,
      commitAuthorAvatar: unprocessed[index]!.commitAuthorAvatar,
      commitDate: new Date(unprocessed[index]!.commitDate),
      summary,
    })),
  });
}

async function summarizeCommit(
  githubUrl: string,
  commitHash: string,
): Promise<string> {
  const response = await fetch(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: { Accept: "application/vnd.github.v3.diff" },
  });

  if (!response.ok) {
    return "Failed to fetch diff";
  }

  const diff = await response.text();
  return (await aiSummarize(diff)) ?? "No summary available";
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
