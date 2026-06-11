import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { GitCommit } from "lucide-react";

interface Commit {
  sha: string;
  message: string;
  authorName: string;
  authorAvatar: string;
  date: string;
}

interface Props {
  commits: Commit[];
  owner: string;
  repo: string;
}

export default function CommitList({ commits, owner, repo }: Props) {
  if (commits.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-zinc-400">
        No commits found
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {commits.map((commit) => (
        <Link
          key={commit.sha}
          href={`/${owner}/${repo}/commit/${commit.sha}`}
          className="flex items-center gap-3 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          {commit.authorAvatar ? (
            <Image
              src={commit.authorAvatar}
              alt={commit.authorName}
              width={32}
              height={32}
              className="shrink-0 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <GitCommit className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {commit.message}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="text-zinc-500 dark:text-zinc-400">{commit.authorName}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(commit.date), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <code className="shrink-0 font-mono text-xs text-zinc-400 dark:text-zinc-500">
            {commit.sha.slice(0, 7)}
          </code>
        </Link>
      ))}
    </div>
  );
}
