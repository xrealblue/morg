import { db } from "~/server/db";
import { Octokit } from "octokit";
import { getCachedPR, setCachedPR } from "./cache";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface PRFileInput {
  fileName: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string | null;
}

interface PRDetailInput {
  prNumber: number;
  title: string;
  body: string | null;
  state: string;
  authorName: string;
  authorAvatar: string | null;
  baseBranch: string;
  headBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  mergedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  files: PRFileInput[];
}

export async function fetchPRFromGitHub(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PRDetailInput> {
  const [prRes, filesRes] = await Promise.all([
    octokit.rest.pulls.get({ owner, repo, pull_number: prNumber }),
    octokit.rest.pulls.listFiles({ owner, repo, pull_number: prNumber }),
  ]);

  const pr = prRes.data;
  const files = filesRes.data;

  return {
    prNumber: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.merged_at ? "merged" : pr.state,
    authorName: pr.user?.login ?? "Unknown",
    authorAvatar: pr.user?.avatar_url ?? null,
    baseBranch: pr.base?.ref ?? "main",
    headBranch: pr.head?.ref ?? "main",
    additions: pr.additions ?? 0,
    deletions: pr.deletions ?? 0,
    changedFiles: pr.changed_files ?? 0,
    mergedAt: pr.merged_at ?? null,
    closedAt: pr.closed_at ?? null,
    createdAt: pr.created_at,
    files: files.map((f) => ({
      fileName: f.filename,
      status: f.status ?? "modified",
      additions: f.additions ?? 0,
      deletions: f.deletions ?? 0,
      patch: f.patch ?? null,
    })),
  };
}

export async function storePullRequest(
  projectId: string,
  detail: PRDetailInput,
) {
  const pr = await db.pullRequest.upsert({
    where: {
      projectId_prNumber: { projectId, prNumber: detail.prNumber },
    },
    create: {
      projectId,
      prNumber: detail.prNumber,
      title: detail.title,
      body: detail.body,
      state: detail.state,
      authorName: detail.authorName,
      authorAvatar: detail.authorAvatar,
      baseBranch: detail.baseBranch,
      headBranch: detail.headBranch,
      additions: detail.additions,
      deletions: detail.deletions,
      changedFiles: detail.changedFiles,
      mergedAt: detail.mergedAt ? new Date(detail.mergedAt) : null,
      closedAt: detail.closedAt ? new Date(detail.closedAt) : null,
    },
    update: {
      title: detail.title,
      body: detail.body,
      state: detail.state,
      additions: detail.additions,
      deletions: detail.deletions,
      changedFiles: detail.changedFiles,
      mergedAt: detail.mergedAt ? new Date(detail.mergedAt) : null,
      closedAt: detail.closedAt ? new Date(detail.closedAt) : null,
    },
  });

  const existingFiles = await db.pullRequestFile.findMany({
    where: { pullRequestId: pr.id },
    select: { fileName: true },
  });
  const existingNames = new Set(existingFiles.map((f) => f.fileName));
  const newFiles = detail.files.filter((f) => !existingNames.has(f.fileName));

  if (newFiles.length > 0) {
    await db.pullRequestFile.createMany({
      data: newFiles.map((f) => ({
        pullRequestId: pr.id,
        fileName: f.fileName,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch,
      })),
    });
  }

  return pr;
}

export async function getPullRequestDetail(
  owner: string,
  repo: string,
  prNumber: number,
) {
  const fullName = `${owner}/${repo}`;

  const cached = await getCachedPR(fullName, prNumber);
  if (cached) {
    return cached.data as PRDetailInput & { summary: string | null };
  }

  const detail = await fetchPRFromGitHub(owner, repo, prNumber);
  await setCachedPR(fullName, prNumber, detail);

  return detail;
}

export async function syncProjectPullRequests(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });
  if (!project?.githubUrl) return;

  const parts = project.githubUrl.replace(/\/+$/, "").split("/");
  const owner = parts[parts.length - 2]!;
  const repo = parts[parts.length - 1]!;

  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
    per_page: 20,
  });

  for (const pr of prs) {
    const detail = await fetchPRFromGitHub(owner, repo, pr.number);
    await storePullRequest(projectId, detail);
  }
}
