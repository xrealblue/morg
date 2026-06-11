import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

async function generateWithFallback(prompt: string | string[]): Promise<string> {
  let lastError: unknown;
  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = genai.getGenerativeModel({ model: modelName });
        const response = await model.generateContent(prompt);
        return response.response.text();
      } catch (e) {
        lastError = e;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }
  }
  throw lastError;
}

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

  return generateWithFallback(prompt);
}

export async function summarizeCode(doc: Document): Promise<string> {
  const code = doc.pageContent.slice(0, 10000);
  const fileName = doc.metadata.source as string;

  try {
    return await generateWithFallback([
      `You are a senior engineer onboarding a new developer.`,
      `Summarize the purpose of the file "${fileName}" in no more than 100 words.
Code:
---
${code}
---`,
    ]);
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
