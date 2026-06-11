import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
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
          userToProjects: {
            create: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      // Background: poll commits and index repo
      void pollCommits(project.id).catch(console.error);
      void indexGithubRepo(
        project.id,
        input.githubUrl,
        input.githubToken,
      ).catch(console.error);

      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: { userId: ctx.session.user.id },
        },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getCommits: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Trigger background poll for new commits
      void pollCommits(input.projectId).catch(console.error);

      return ctx.db.commit.findMany({
        where: { projectId: input.projectId },
        orderBy: { commitDate: "desc" },
      });
    }),

  loadMoreCommits: protectedProcedure
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
});
