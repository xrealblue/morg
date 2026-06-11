import { formatDistanceToNow } from "date-fns";

interface Props {
  authorName: string;
  authorAvatar: string;
  hash: string;
  message: string;
  totalFiles: number;
  additions: number;
  deletions: number;
  date: string;
}

export default function CommitHeader({
  authorName,
  authorAvatar,
  hash,
  message,
  totalFiles,
  additions,
  deletions,
  date,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-10 w-10 rounded-full"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900">{authorName}</span>
              <span className="text-sm text-zinc-500">
                {formatDistanceToNow(new Date(date), { addSuffix: true })}
              </span>
            </div>
            <h1 className="mt-1 text-lg font-semibold text-zinc-900">
              {message}
            </h1>
          </div>
        </div>
        <code className="shrink-0 rounded-md bg-zinc-100 px-3 py-1 font-mono text-sm text-zinc-600">
          {hash.slice(0, 7)}
        </code>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="text-zinc-500">
          <strong className="text-zinc-700">{totalFiles}</strong> files changed
        </span>
        <span className="text-emerald-600">
          +<strong>{additions}</strong>
        </span>
        <span className="text-red-600">
          -<strong>{deletions}</strong>
        </span>
      </div>
    </div>
  );
}
