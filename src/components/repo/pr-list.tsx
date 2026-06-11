import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { GitPullRequest, Check, X, GitMerge } from "lucide-react";

interface PR {
  number: number;
  title: string;
  state: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}

interface Props {
  pullRequests: PR[];
  owner: string;
  repo: string;
}

function getStateBadge(state: string) {
  switch (state) {
    case "open":
      return {
        icon: GitPullRequest,
        bg: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        label: "Open",
      };
    case "merged":
      return {
        icon: GitMerge,
        bg: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
        label: "Merged",
      };
    case "closed":
      return {
        icon: X,
        bg: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        label: "Closed",
      };
    default:
      return {
        icon: GitPullRequest,
        bg: "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
        label: state,
      };
  }
}

export default function PRList({ pullRequests, owner, repo }: Props) {
  if (pullRequests.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-zinc-400">
        No pull requests found
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {pullRequests.map((pr) => {
        const badge = getStateBadge(pr.state);
        const Icon = badge.icon;
        return (
          <Link
            key={pr.number}
            href={`/${owner}/${repo}/pull/${pr.number}`}
            className="flex items-center gap-3 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${badge.bg}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                #{pr.number} {pr.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium ${badge.bg}`}>
                  <Icon className="h-3 w-3" />
                  {badge.label}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">{pr.authorName}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(pr.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
