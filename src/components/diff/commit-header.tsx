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
    <div className="border-b border-border bg-background px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-8 w-8 rounded-full"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(date), { addSuffix: true })}
              </span>
            </div>
            <h1 className="mt-0.5 text-base font-semibold text-foreground">
              {message}
            </h1>
          </div>
        </div>
        <code className="shrink-0 bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {hash.slice(0, 7)}
        </code>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">
          <strong className="text-foreground">{totalFiles}</strong> files changed
        </span>
        <span className="text-emerald-400">
          +<strong>{additions}</strong>
        </span>
        <span className="text-red-400">
          -<strong>{deletions}</strong>
        </span>
      </div>
    </div>
  );
}
