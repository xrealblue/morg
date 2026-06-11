import { projectRouter } from "~/server/api/routers/project";
import { githubRouter } from "~/server/api/routers/github";
import { publicRouter } from "~/server/api/routers/public";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  github: githubRouter,
  public: publicRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
