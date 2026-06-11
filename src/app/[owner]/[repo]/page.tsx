import { notFound } from "next/navigation";
import RepoHeader from "~/components/repo/repo-header";
import CommitList from "~/components/repo/commit-list";
import PRList from "~/components/repo/pr-list";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { headers } from "next/headers";

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

        <div className="rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100">
            <div className="flex">
              <div className="border-b-2 border-zinc-900 px-6 py-3 text-sm font-medium text-zinc-900">
                Commits
              </div>
              <div className="px-6 py-3 text-sm font-medium text-zinc-400">
                Pull Requests
              </div>
            </div>
          </div>
          <div className="p-4">
            <CommitList
              commits={overview.commits}
              owner={owner}
              repo={repo}
            />
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
