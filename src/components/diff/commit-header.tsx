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
    <div className="border-b border-[var(--color-border)] bg-[var(--background)] px-6 py-4">
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
              <span className="text-sm font-medium text-[var(--foreground)]">{authorName}</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {formatDistanceToNow(new Date(date), { addSuffix: true })}
              </span>
            </div>
            <h1 className="mt-0.5 text-base font-semibold text-[var(--foreground)]">
              {message}
            </h1>
          </div>
        </div>
        <code className="shrink-0 bg-[var(--muted)] px-2.5 py-0.5 font-mono text-xs text-[var(--muted-foreground)]">
          {hash.slice(0, 7)}
        </code>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs">
        <span className="text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">{totalFiles}</strong> files changed
        </span>
        <span className="text-[var(--diffshub-comment-add-fg)]">
          +<strong>{additions}</strong>
        </span>
        <span className="text-[var(--diffshub-comment-del-fg)]">
          -<strong>{deletions}</strong>
        </span>
      </div>
    </div>
  );
}
