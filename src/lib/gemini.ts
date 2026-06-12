import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

const TIMEOUT_MS = 20000;

async function generateWithTimeout(prompt: string | string[]): Promise<string> {
  let lastError: unknown;
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
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
  const prompt = `You are an expert code reviewer analyzing a git diff.

For each file changed, provide:
- **[file name]** — what changed and why it matters

Focus on the functional impact, not just what lines changed. Keep it concise — 2-4 bullet points.

Diff:
${diff}`;

  return generateWithTimeout(prompt);
}

export async function summarizeCode(doc: Document): Promise<string> {
  const code = doc.pageContent.slice(0, 10000);
  const fileName = doc.metadata.source as string;

  try {
    return await generateWithTimeout([
      `You are a senior engineer documenting a codebase for new contributors.

For the file "${fileName}", provide:
1. One-sentence purpose
2. What other files it interacts with
3. Key functions/classes it exports

Keep under 100 words.

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
    model: "gemini-embedding-001",
  });
  const response = await embeddingModel.embedContent(text);
  return response.embedding.values;
}

export { generateWithTimeout };
