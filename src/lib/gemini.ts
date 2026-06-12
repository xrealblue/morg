import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

const TIMEOUT_MS = 20000;

async function generateWithTimeout(prompt: string | string[]): Promise<string> {
  let lastError: unknown;
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const model = genai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        clearTimeout(timeoutId);
        return result.response.text();
      } catch (e) {
        lastError = e;
        if (attempt < 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }
  console.error("Gemini API all attempts failed:", lastError);
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

  return generateWithTimeout(prompt);
}

export async function summarizeCode(doc: Document): Promise<string> {
  const code = doc.pageContent.slice(0, 10000);
  const fileName = doc.metadata.source as string;

  try {
    return await generateWithTimeout([
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

export { generateWithTimeout };
