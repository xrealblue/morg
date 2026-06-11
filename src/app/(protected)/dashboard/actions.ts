"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "~/lib/gemini";
import { db } from "~/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue("");

  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
           1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
      AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `) as Array<{
    fileName: string;
    sourceCode: string;
    summary: string;
  }>;

  let context = "";
  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`;
  }

  void (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.0-flash"),
      prompt: `You are an AI code assistant who answers questions about the codebase.
Your target audience is a technical developer looking to understand the codebase.
Be concise, accurate, and helpful. If the question asks about code or a specific file,
provide detailed answers with step-by-step instructions and code snippets.

START CONTEXT BLOCK
${context}
END CONTEXT BLOCK

START QUESTION
${question}
END QUESTION

If the context does not provide the answer, say "I'm sorry, but I don't have enough context to answer that question."
Do not invent anything not drawn from the context.`,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    filesReferences: result,
  };
}
