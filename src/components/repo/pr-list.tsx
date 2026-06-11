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
        bg: "bg-green-50 text-green-700",
        label: "Open",
      };
    case "merged":
      return {
        icon: GitMerge,
        bg: "bg-purple-50 text-purple-700",
        label: "Merged",
      };
    case "closed":
      return {
        icon: X,
        bg: "bg-red-50 text-red-700",
        label: "Closed",
      };
    default:
      return {
        icon: GitPullRequest,
        bg: "bg-zinc-50 text-zinc-600",
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
            className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition hover:bg-zinc-50 hover:shadow-sm"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${badge.bg}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800">
                #{pr.number} {pr.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${badge.bg}`}>
                  <Icon className="h-3 w-3" />
                  {badge.label}
                </span>
                <span className="text-zinc-500">{pr.authorName}</span>
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
