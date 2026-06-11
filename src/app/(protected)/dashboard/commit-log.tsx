"use client";

import { api } from "~/trpc/react";
import useProject from "~/hooks/use-project";
import { formatDistanceToNow } from "date-fns";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function CommitLog() {
  const { project } = useProject();
  const [page, setPage] = useState(1);

  const { data: commits, isLoading, refetch } = api.project.getCommits.useQuery(
    { projectId: project?.id ?? "" },
    { enabled: !!project?.id },
  );

  const loadMore = api.project.loadMoreCommits.useMutation({
    onSuccess: () => {
      void refetch();
      setPage((prev) => prev + 1);
    },
  });

  if (!project) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">
        Recent Commits
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      ) : commits?.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          No commits found
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {commits?.map((commit) => (
              <div
                key={commit.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition hover:bg-zinc-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800">
                      {commit.commitMessage}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {commit.commitAuthorAvatar && (
                        <Image
                          src={commit.commitAuthorAvatar}
                          alt={commit.commitAuthorName}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-xs text-zinc-500">
                        {commit.commitAuthorName}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {formatDistanceToNow(new Date(commit.commitDate), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <code className="shrink-0 text-xs text-zinc-400">
                    {commit.commitHash.slice(0, 7)}
                  </code>
                </div>
                {commit.summary && (
                  <pre className="mt-3 whitespace-pre-wrap border-t border-zinc-200 pt-3 text-xs text-zinc-600">
                    {commit.summary}
                  </pre>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() =>
                loadMore.mutate({ projectId: project.id, page: page + 1 })
              }
              disabled={loadMore.isPending}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              {loadMore.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              Load More
            </button>
          </div>
        </>
      )}
    </div>
  );
}
