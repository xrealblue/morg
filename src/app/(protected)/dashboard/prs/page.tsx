"use client";

import { api } from "~/trpc/react";
import useProject from "~/hooks/use-project";
import { GitPullRequest, GitMerge, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

function getStateBadge(state: string) {
  switch (state) {
    case "open":
      return { icon: GitPullRequest, bg: "bg-green-50 text-green-700", label: "Open" };
    case "merged":
      return { icon: GitMerge, bg: "bg-purple-50 text-purple-700", label: "Merged" };
    case "closed":
      return { icon: X, bg: "bg-red-50 text-red-700", label: "Closed" };
    default:
      return { icon: GitPullRequest, bg: "bg-zinc-50 text-zinc-600", label: state };
  }
}

export default function PRListPage() {
  const { project } = useProject();

  const { data: prs, isLoading } = api.project.getPullRequests.useQuery(
    { projectId: project?.id ?? "" },
    { enabled: !!project?.id },
  );

  const { mutate: sync, isPending: isSyncing } = api.project.syncPullRequests.useMutation();

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-zinc-900">No project selected</h2>
        <p className="mt-2 text-zinc-500">
          Select a project from the sidebar to view pull requests
        </p>
      </div>
    );
  }

  const githubParts = project.githubUrl.replace(/\/+$/, "").split("/");
  const owner = githubParts[githubParts.length - 2];
  const repo = githubParts[githubParts.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Pull Requests</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/${owner}/${repo}/pulls`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700"
          >
            <ExternalLink className="h-4 w-4" />
            View public
          </Link>
          <button
            onClick={() => sync({ projectId: project.id })}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            {isSyncing ? "Syncing..." : "Sync PRs"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      ) : !prs || prs.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <GitPullRequest className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-3 text-sm text-zinc-500">No pull requests found</p>
          <button
            onClick={() => sync({ projectId: project.id })}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Sync from GitHub
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {prs.map((pr) => {
            const badge = getStateBadge(pr.state);
            const Icon = badge.icon;
            return (
              <Link
                key={pr.id}
                href={`/${owner}/${repo}/pull/${pr.prNumber}`}
                className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-white p-4 transition hover:bg-zinc-50"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${badge.bg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    #{pr.prNumber} {pr.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${badge.bg}`}>
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </span>
                    <span className="text-zinc-500">{pr.authorName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="hidden items-center gap-3 text-xs text-zinc-400 sm:flex">
                  <span className="text-emerald-600">+{pr.additions}</span>
                  <span className="text-red-600">-{pr.deletions}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
