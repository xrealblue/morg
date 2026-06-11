import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "~/server/db";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genai.getGenerativeModel({ model: "gemini-3.5-flash" });

export async function summarizeFileDiff(
  fileName: string,
  patch: string,
): Promise<string> {
  if (!patch || patch.length === 0) return "No changes in this file.";

  const prompt = `You are a code reviewer. Summarize what changed in "${fileName}" in 1-2 sentences. Focus on the purpose of the change, not the mechanics.

Diff:
${patch.slice(0, 3000)}`;

  try {
    const response = await model.generateContent(prompt);
    return response.response.text();
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
    const response = await model.generateContent(prompt);
    const summary = response.response.text();

    await db.pullRequest.update({
      where: { id: prId },
      data: { aiSummary: summary },
    });

    return summary;
  } catch {
    return "Failed to generate summary.";
  }
}
