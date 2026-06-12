import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const githubRouter = createTRPCRouter({
  getUserRepos: publicProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ input }) => {
      const token = process.env.GITHUB_TOKEN;

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `https://api.github.com/users/${input.username}/repos?sort=updated&per_page=100`,
        { headers },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = (await response.json()) as Array<{
        id: number;
        name: string;
        html_url: string;
        description: string | null;
        language: string | null;
        updated_at: string;
        private: boolean;
      }>;

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        updatedAt: repo.updated_at,
        isPrivate: repo.private,
      }));
    }),
});
