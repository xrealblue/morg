import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import CommitList from "~/components/repo/commit-list";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function CommitsPage({ params }: Props) {
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
            className="text-sm text-zinc-400 hover:text-zinc-600"
          >
            ← {owner}/{repo}
          </a>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Commits
          </h1>
        </div>

        <CommitList commits={overview.commits} owner={owner} repo={repo} />
      </div>
    );
  } catch {
    notFound();
  }
}
