import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genai.getGenerativeModel({ model: "gemini-3.5-flash" });

export async function aiSummarize(diff: string): Promise<string> {
  const prompt = `You are an expert programmer summarizing a git diff.
Reminders about git diff format:
- Lines starting with \`+\` were added
- Lines starting with \`-\` were deleted
- Other lines are context

Provide a concise bullet-point summary of the changes. Include file names in brackets.
Keep it brief — most diffs need only 2-4 bullet points.

Diff:
${diff}`;

  const response = await model.generateContent(prompt);
  return response.response.text();
}

export async function summarizeCode(doc: Document): Promise<string> {
  const code = doc.pageContent.slice(0, 10000);
  const fileName = doc.metadata.source as string;

  try {
    const response = await model.generateContent([
      `You are a senior engineer onboarding a new developer.`,
      `Summarize the purpose of the file "${fileName}" in no more than 100 words.
Code:
---
${code}
---`,
    ]);
    return response.response.text();
  } catch {
    return `Error summarizing ${fileName}`;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingModel = genai.getGenerativeModel({
    model: "text-embedding-004",
  });
  const response = await embeddingModel.embedContent(text);
  return response.embedding.values;
}
