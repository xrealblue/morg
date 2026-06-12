import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";
import { getCommitWithFiles } from "~/lib/github-commit";
import { syncProjectPullRequests } from "~/lib/github-pr";
import { generatePerFileSummary } from "~/lib/ai-summary";

export const projectRouter = createTRPCRouter({
  createProject: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required"),
        githubUrl: z
          .string()
          .url("Must be a valid URL")
          .regex(
            /^https?:\/\/(?:www\.)?github\.com\/.+\/.+/i,
            "Must be a valid GitHub repository URL",
          ),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
        },
      });

      void pollCommits(project.id).catch(console.error);
      void indexGithubRepo(
        project.id,
        input.githubUrl,
        input.githubToken,
      ).catch(console.error);

      return project;
    }),

  getProjects: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }),

  getCommits: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      void pollCommits(input.projectId).catch(console.error);

      return ctx.db.commit.findMany({
        where: { projectId: input.projectId },
        orderBy: { commitDate: "desc" },
      });
    }),

  getCommitDetail: publicProcedure
    .input(z.object({ commitId: z.string() }))
    .query(async ({ input }) => {
      return getCommitWithFiles(input.commitId);
    }),

  loadMoreCommits: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        page: z.number().min(2).default(2),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await pollCommits(input.projectId, input.page);
      return ctx.db.commit.findMany({
        where: { projectId: input.projectId },
        orderBy: { commitDate: "desc" },
      });
    }),

  getPullRequests: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.pullRequest.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getPullRequestDetail: publicProcedure
    .input(z.object({ pullRequestId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.pullRequest.findUnique({
        where: { id: input.pullRequestId },
        include: { files: { orderBy: { fileName: "asc" } } },
      });
    }),

  syncPullRequests: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => {
      await syncProjectPullRequests(input.projectId);
    }),

  summarizeFile: publicProcedure
    .input(z.object({ commitFileId: z.string() }))
    .mutation(async ({ input }) => {
      return generatePerFileSummary(input.commitFileId);
    }),
});
