import { db } from "~/server/db";
import { aiSummarize, generateWithTimeout } from "./gemini";
import {
  getCachedCommit, setCachedCommit,
  getCachedPR, setCachedPR,
} from "./cache";

export async function summarizeFileDiff(
  fileName: string,
  patch: string,
): Promise<string> {
  if (!patch || patch.length === 0) return "No changes in this file.";

  const prompt = `You are a code reviewer. Summarize what changed in "${fileName}" in 1-2 sentences. Focus on the purpose of the change, not the mechanics.

Diff:
${patch.slice(0, 3000)}`;

  try {
    return await generateWithTimeout(prompt);
  } catch {
    return "Failed to generate summary.";
  }
}

export async function generatePerFileSummary(
  commitFileId: string,
): Promise<string> {
  const file = await db.commitFile.findUnique({
    where: { id: commitFileId },
  });

  if (!file || !file.patch) return "No diff available.";

  const summary = await summarizeFileDiff(file.fileName, file.patch);

  await db.commitFile.update({
    where: { id: commitFileId },
    data: { aiSummary: summary, aiSummaryGeneratedAt: new Date() },
  });

  return summary;
}

export async function summarizePullRequest(
  prId: string,
): Promise<string> {
  const pr = await db.pullRequest.findUnique({
    where: { id: prId },
    include: { files: true },
  });

  if (!pr) return "Pull request not found.";

  const fileDiffs = pr.files
    .map((f) => `File: ${f.fileName} (${f.status})\n${f.patch ?? ""}`)
    .join("\n\n");

  const prompt = `Summarize this pull request "#${pr.prNumber}: ${pr.title}" in 2-4 bullet points. Focus on the overall goal and key changes.

Changes:
${fileDiffs.slice(0, 5000)}`;

  try {
    const summary = await generateWithTimeout(prompt);

    await db.pullRequest.update({
      where: { id: prId },
      data: { aiSummary: summary },
    });

    return summary;
  } catch {
    return "Failed to generate summary.";
  }
}

function extractPatches(data: Record<string, unknown>): string {
  const files = data.files as { fileName?: string; patch?: string | null; status?: string }[] | undefined;
  if (!files) return "";
  return files
    .map((f) => `File: ${f.fileName ?? "unknown"} (${f.status ?? "modified"})\n${f.patch ?? ""}`)
    .filter(Boolean)
    .join("\n\n");
}

export async function summarizeCommitCache(
  owner: string,
  repo: string,
  sha: string,
): Promise<string> {
  const fullName = `${owner}/${repo}`;
  const cached = await getCachedCommit(fullName, sha);
  if (!cached) return "Commit not found in cache.";

  const data = cached.data as Record<string, unknown>;
  const patches = extractPatches(data);
  if (!patches) return "No diff available.";

  try {
    const summary = await aiSummarize(patches);
    await setCachedCommit(fullName, sha, cached.data, summary);
    return summary;
  } catch {
    return "Failed to generate summary.";
  }
}

export async function summarizePRCache(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<string> {
  const fullName = `${owner}/${repo}`;
  const cached = await getCachedPR(fullName, prNumber);
  if (!cached) return "Pull request not found.";

  const data = cached.data as Record<string, unknown>;
  const patches = extractPatches(data);
  if (!patches) return "No diff available.";

  const prompt = `Summarize this pull request in 2-4 bullet points. Focus on the overall goal and key changes.

Changes:
${patches.slice(0, 5000)}`;

  try {
    const summary = await generateWithTimeout(prompt);
    await setCachedPR(fullName, prNumber, cached.data, summary);
    return summary;
  } catch {
    return "Failed to generate summary.";
  }
}

export async function summarizeFileFromCache(
  owner: string,
  repo: string,
  sha: string,
  fileName: string,
): Promise<string> {
  const fullName = `${owner}/${repo}`;
  const cached = await getCachedCommit(fullName, sha);
  if (!cached) return "Commit not found.";

  const data = cached.data as Record<string, unknown>;
  const files = data.files as { fileName?: string; patch?: string | null }[] | undefined;
  const file = files?.find((f) => f.fileName === fileName);
  if (!file) return "File not found.";

  return summarizeFileDiff(fileName, file.patch ?? "");
}
