"use client";

import { use, useMemo } from "react";
import { api } from "~/trpc/react";
import AISummaryCard from "~/components/diff/ai-summary-card";
import FileTreeSidebar from "~/components/diff/file-tree-sidebar";
import { ThemedCodeView } from "~/components/theming/react/ThemedCodeView";
import { processPatch, type CodeViewDiffItem } from "@pierre/diffs";
import type { FileChange } from "~/components/diff/types";

function constructPatch(files: FileChange[]): string {
  return files
    .map((f) => {
      const patch = f.patch;
      if (!patch) return "";
      const path = f.fileName;
      let header = `diff --git a/${path} b/${path}\n`;
      if (f.status === "added") {
        header += `new file mode 100644\nindex 0000000..0000000 100644\n--- /dev/null\n+++ b/${path}\n`;
      } else if (f.status === "removed") {
        header += `deleted file mode 100644\nindex 0000000..0000000 100644\n--- a/${path}\n+++ /dev/null\n`;
      } else {
        header += `index 0000000..0000000 100644\n--- a/${path}\n+++ b/${path}\n`;
      }
      return header + patch;
    })
    .filter(Boolean)
    .join("\n");
}

interface Props {
  params: Promise<{ owner: string; repo: string; sha: string }>;
}

export default function CommitPage({ params }: Props) {
  const { owner, repo, sha } = use(params);

  const { data: commit, isLoading } = api.public.getCommit.useQuery({
    owner,
    repo,
    sha,
  });

  const files = useMemo(
    () => ((commit as unknown as Record<string, unknown>)?.files as FileChange[] | undefined) ?? [],
    [commit],
  );

  const diffItems = useMemo<CodeViewDiffItem[]>(() => {
    if (files.length === 0) return [];
    const fullPatch = constructPatch(files);
    if (!fullPatch) return [];
    try {
      const parsed = processPatch(fullPatch, sha);
      return parsed.files.map((fd) => ({
        id: fd.name,
        type: "diff" as const,
        fileDiff: fd,
      }));
    } catch {
      return [];
    }
  }, [files, sha]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--foreground)]" />
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)]">Commit not found</p>
      </div>
    );
  }

  const d = commit as unknown as Record<string, unknown>;
  const stats = (d.stats ?? {}) as Record<string, number>;

  return (
    <div className="flex h-screen">
      <div className="flex w-80 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--diffshub-sidebar-bg)]">
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-2.5">
            {(d.commitAuthorAvatar as string) && (
              <img
                src={d.commitAuthorAvatar as string}
                alt={d.commitAuthorName as string}
                className="h-7 w-7 rounded-full"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-[var(--foreground)]">
                {d.commitMessage as string}
              </h1>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <code className="font-mono text-[var(--muted-foreground)]">{(d.commitHash as string)?.slice(0, 7)}</code>
            <span className="text-[var(--diffshub-comment-add-fg)]">+{(stats.additions as number)}</span>
            <span className="text-[var(--diffshub-comment-del-fg)]">-{(stats.deletions as number)}</span>
            <span>{(stats.total as number) ?? files.length} files</span>
          </div>
        </div>

        <AISummaryCard summary={(d.summary as string) ?? null} />

        <div className="flex-1 overflow-hidden">
          <FileTreeSidebar
            files={files}
            activeFile={null}
            onFileSelect={() => {}}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
        {diffItems.length > 0 ? (
          <ThemedCodeView initialItems={diffItems} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted-foreground)]/70">
            No files changed
          </div>
        )}
      </div>
    </div>
  );
}
