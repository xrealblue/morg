import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getCommitDetail, getCommitWithFiles } from "~/lib/github-commit";
import { getPullRequestDetail } from "~/lib/github-pr";
import { getRepoInfo, getRepoOverview } from "~/lib/github-repo";
import { getRepoFileTree } from "~/lib/github-file-tree";
import {
  generatePerFileSummary,
  summarizePullRequest,
  summarizeCommitCache,
  summarizePRCache,
  summarizeFileFromCache,
} from "~/lib/ai-summary";

export const publicRouter = createTRPCRouter({
  getRepo: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input }) => {
      return getRepoInfo(input.owner, input.repo);
    }),

  getRepoOverview: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input }) => {
      return getRepoOverview(input.owner, input.repo);
    }),

  getCommit: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), sha: z.string() }))
    .query(async ({ input }) => {
      return getCommitDetail(input.owner, input.repo, input.sha);
    }),

  getPullRequest: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), prNumber: z.number() }))
    .query(async ({ input }) => {
      return getPullRequestDetail(input.owner, input.repo, input.prNumber);
    }),

  getFileTree: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), ref: z.string().optional() }))
    .query(async ({ input }) => {
      return getRepoFileTree(input.owner, input.repo, input.ref);
    }),

  summarizeFile: publicProcedure
    .input(z.object({ commitFileId: z.string() }))
    .mutation(async ({ input }) => {
      return generatePerFileSummary(input.commitFileId);
    }),

  summarizePR: publicProcedure
    .input(z.object({ pullRequestId: z.string() }))
    .mutation(async ({ input }) => {
      return summarizePullRequest(input.pullRequestId);
    }),

  regenerateCommitSummary: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), sha: z.string() }))
    .mutation(async ({ input }) => {
      return summarizeCommitCache(input.owner, input.repo, input.sha);
    }),

  regeneratePRSummary: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), prNumber: z.number() }))
    .mutation(async ({ input }) => {
      return summarizePRCache(input.owner, input.repo, input.prNumber);
    }),

  summarizeFileByCommit: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), sha: z.string(), fileName: z.string() }))
    .mutation(async ({ input }) => {
      return summarizeFileFromCache(input.owner, input.repo, input.sha, input.fileName);
    }),

  summarizeFileByPR: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string(), prNumber: z.number(), fileName: z.string() }))
    .mutation(async ({ input }) => {
      const { getCachedPR } = await import("~/lib/cache");
      const { summarizeFileDiff } = await import("~/lib/ai-summary");
      const fullName = `${input.owner}/${input.repo}`;
      const cached = await getCachedPR(fullName, input.prNumber);
      if (!cached) return "PR not found.";
      const data = cached.data as Record<string, unknown>;
      const files = data.files as { fileName?: string; patch?: string | null }[] | undefined;
      const file = files?.find((f) => f.fileName === input.fileName);
      if (!file) return "File not found.";
      return summarizeFileDiff(input.fileName, file.patch ?? "");
    }),
});
