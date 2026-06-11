import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import RepoHeader from "~/components/repo/repo-header";
import CommitList from "~/components/repo/commit-list";
import PRList from "~/components/repo/pr-list";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function RepoLandingPage({ params }: Props) {
  const { owner, repo } = await params;

  const ctx = await createTRPCContext({ headers: await headers() });
  const caller = createCaller(ctx);

  try {
    const overview = await caller.public.getRepoOverview({ owner, repo });

    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <RepoHeader
          name={overview.repo.name}
          fullName={overview.repo.fullName}
          description={overview.repo.description}
          stars={overview.repo.stars}
          forks={overview.repo.forks}
          language={overview.repo.language}
          defaultBranch={overview.repo.defaultBranch}
          ownerAvatar={overview.repo.ownerAvatar}
        />

        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/${owner}/${repo}`}
            className="border-b-2 border-zinc-900 dark:border-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Commits
          </Link>
          <Link
            href={`/${owner}/${repo}/pulls`}
            className="px-6 py-3 text-sm font-medium text-zinc-400 dark:text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Pull Requests
          </Link>
          <Link
            href={`/${owner}/${repo}/tree/${overview.repo.defaultBranch}`}
            className="px-6 py-3 text-sm font-medium text-zinc-400 dark:text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Files
          </Link>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Commits</h2>
            <Link
              href={`/${owner}/${repo}/commits`}
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              View all →
            </Link>
          </div>
          <CommitList commits={overview.commits} owner={owner} repo={repo} />
        </div>

        {overview.pullRequests.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Pull Requests</h2>
              <Link
                href={`/${owner}/${repo}/pulls`}
                className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                View all →
              </Link>
            </div>
            <PRList pullRequests={overview.pullRequests.slice(0, 5)} owner={owner} repo={repo} />
          </div>
        )}
      </div>
    );
  } catch {
    notFound();
  }
}
