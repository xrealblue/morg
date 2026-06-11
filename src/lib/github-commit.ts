import { db } from "~/server/db";
import { Octokit } from "octokit";
import { getCachedCommit, setCachedCommit } from "./cache";
import { aiSummarize } from "./gemini";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface CommitFileInput {
  fileName: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string | null;
}

interface CommitDetailInput {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
  stats: { total: number; additions: number; deletions: number };
  files: CommitFileInput[];
}

function parseGithubUrl(githubUrl: string) {
  const urlParts = githubUrl.replace(/\/+$/, "").split("/");
  const repo = urlParts[urlParts.length - 1];
  const owner = urlParts[urlParts.length - 2];
  if (!owner || !repo) throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  return { owner, repo };
}

export async function fetchCommitFromGitHub(
  owner: string,
  repo: string,
  sha: string,
): Promise<CommitDetailInput> {
  const { data } = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  return {
    commitHash: data.sha,
    commitMessage: data.commit.message,
    commitAuthorName: data.commit.author?.name ?? "Unknown",
    commitAuthorAvatar: data.author?.avatar_url ?? "",
    commitDate: data.commit.author?.date ?? new Date().toISOString(),
    stats: {
      total: data.files?.length ?? 0,
      additions: data.stats?.additions ?? 0,
      deletions: data.stats?.deletions ?? 0,
    },
    files: (data.files ?? []).map((f) => ({
      fileName: f.filename,
      status: f.status ?? "modified",
      additions: f.additions ?? 0,
      deletions: f.deletions ?? 0,
      patch: f.patch ?? null,
    })),
  };
}

export async function storeCommitDiff(
  projectId: string,
  commitHash: string,
  detail: CommitDetailInput,
) {
  const commit = await db.commit.upsert({
    where: {
      id: (
        await db.commit.findFirst({
          where: { projectId, commitHash },
          select: { id: true },
        })
      )?.id ?? "",
    },
    create: {
      projectId,
      commitHash: detail.commitHash,
      commitMessage: detail.commitMessage,
      commitAuthorName: detail.commitAuthorName,
      commitAuthorAvatar: detail.commitAuthorAvatar,
      commitDate: new Date(detail.commitDate),
      summary: "Pending AI summary",
      rawDiff: detail.files.map((f) => f.patch).filter(Boolean).join("\n"),
    },
    update: {
      commitMessage: detail.commitMessage,
      commitAuthorName: detail.commitAuthorName,
      commitAuthorAvatar: detail.commitAuthorAvatar,
      commitDate: new Date(detail.commitDate),
    },
  });

  const existingFiles = await db.commitFile.findMany({
    where: { commitId: commit.id },
    select: { fileName: true },
  });
  const existingNames = new Set(existingFiles.map((f) => f.fileName));
  const newFiles = detail.files.filter((f) => !existingNames.has(f.fileName));

  if (newFiles.length > 0) {
    await db.commitFile.createMany({
      data: newFiles.map((f) => ({
        commitId: commit.id,
        fileName: f.fileName,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch,
      })),
    });
  }

  return commit;
}

export async function getCommitDetail(owner: string, repo: string, sha: string) {
  const fullName = `${owner}/${repo}`;

  const cached = await getCachedCommit(fullName, sha);
  if (cached) {
    return cached.data as CommitDetailInput & { summary: string | null };
  }

  const detail = await fetchCommitFromGitHub(owner, repo, sha);

  const summary = await aiSummarize(
    detail.files.map((f) => f.patch).filter(Boolean).join("\n"),
  );

  await setCachedCommit(fullName, sha, detail, summary);

  return { ...detail, summary };
}

export async function getCommitWithFiles(commitId: string) {
  const commit = await db.commit.findUnique({
    where: { id: commitId },
    include: { files: { orderBy: { fileName: "asc" } } },
  });
  return commit;
}
