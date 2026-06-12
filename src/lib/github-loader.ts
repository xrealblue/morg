import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import type { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "~/server/db";

export async function loadGithubRepo(
  githubUrl: string,
  githubToken?: string,
): Promise<Document[]> {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken ?? process.env.GITHUB_TOKEN ?? "",
    branch: "main",
    ignoreFiles: [
      "node_modules",
      "dist",
      "build",
      ".next",
      "coverage",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
      "bun.lock",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 10,
  });

  return loader.load();
}

export async function indexGithubRepo(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const embeddings = await generateAllEmbeddings(docs);

  await Promise.allSettled(
    embeddings.map(async (embedding) => {
      if (!embedding) return;

      const record = await db.sourceCodeEmbedding.create({
        data: {
          fileName: embedding.fileName,
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          projectId,
        },
      });

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE id = ${record.id}
      `;
    }),
  );
}

async function processDoc(doc: Document) {
  const summary = await summarizeCode(doc);
  const embedding = await generateEmbedding(summary);
  return {
    summary,
    embedding: `[${embedding.join(",")}]`,
    sourceCode: doc.pageContent,
    fileName: doc.metadata.source as string,
  };
}

async function generateAllEmbeddings(docs: Document[]) {
  const results: (Awaited<ReturnType<typeof processDoc>> | null)[] = [];
  const concurrency = 5;

  for (let i = 0; i < docs.length; i += concurrency) {
    const batch = docs.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((doc) => processDoc(doc)),
    );
    results.push(
      ...batchResults.map((r) =>
        r.status === "fulfilled" ? r.value : null,
      ),
    );
  }

  return results;
}
