import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import PRList from "~/components/repo/pr-list";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function PullsPage({ params }: Props) {
  const { owner, repo } = await params;

  const ctx = await createTRPCContext({ headers: await headers() });
  const caller = createCaller(ctx);

  try {
    const overview = await caller.public.getRepoOverview({ owner, repo });

    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <a
            href={`/${owner}/${repo}`}
            className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ← {owner}/{repo}
          </a>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Pull Requests
          </h1>
        </div>

        <PRList pullRequests={overview.pullRequests} owner={owner} repo={repo} />
      </div>
    );
  } catch {
    notFound();
  }
}
