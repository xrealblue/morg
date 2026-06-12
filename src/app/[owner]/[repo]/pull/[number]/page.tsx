"use client";

import Image from "next/image";
import { use, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import AISummaryCard from "~/components/diff/ai-summary-card";
import FileTreeSidebar from "~/components/diff/file-tree-sidebar";
import { ThemedCodeView } from "~/components/theming/react/ThemedCodeView";
import { processPatch, type CodeViewDiffItem, type CodeViewItem } from "@pierre/diffs";
import type { FileChange } from "~/components/diff/types";
import { Sparkles, Loader2 } from "lucide-react";

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
  params: Promise<{ owner: string; repo: string; number: string }>;
}

export default function PullRequestPage({ params }: Props) {
  const { owner, repo, number } = use(params);
  const prNumber = parseInt(number, 10);

  const { data: pr, isLoading, refetch } = api.public.getPullRequest.useQuery({
    owner,
    repo,
    prNumber,
  }, {
    refetchInterval: (query) => {
      const data = query.state.data as Record<string, unknown> | undefined;
      if (data && data.summary) return false;
      return 3000;
    },
  });

  const regenerateMutation = api.public.regeneratePRSummary.useMutation({
    onSuccess: () => refetch(),
  });

  const d = pr as unknown as Record<string, unknown> | undefined;
  const summary = (d?.summary as string) ?? null;

  const hasTriggeredGeneration = useRef(false);
  useEffect(() => {
    if (pr && !summary && !regenerateMutation.isPending && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true;
      regenerateMutation.mutate({ owner, repo, prNumber });
    }
  }, [pr, summary, regenerateMutation, owner, repo, prNumber]);

  const fileSummaryMutation = api.public.summarizeFileByPR.useMutation();

  const [fileSummaries, setFileSummaries] = useState<Record<string, string>>({});
  const [summarizingFiles, setSummarizingFiles] = useState<Set<string>>(new Set());

  const files = useMemo(
    () => ((pr as unknown as Record<string, unknown>)?.files as FileChange[] | undefined) ?? [],
    [pr],
  );

  const diffItems = useMemo<CodeViewDiffItem[]>(() => {
    if (files.length === 0) return [];
    const fullPatch = constructPatch(files);
    if (!fullPatch) return [];
    try {
      const parsed = processPatch(fullPatch, `pr-${prNumber}`);
      return parsed.files.map((fd) => ({
        id: fd.name,
        type: "diff" as const,
        fileDiff: fd,
      }));
    } catch {
      return [];
    }
  }, [files, prNumber]);

  const handleFileSelect = useCallback((fileName: string) => {
    const idx = files.findIndex((f) => f.fileName === fileName);
    if (idx === -1) return;
    const el = document.querySelector(`[data-diff-file-idx="${idx}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [files]);

  const handleSummarizeFile = useCallback(
    (fileName: string) => {
      if (summarizingFiles.has(fileName) || fileSummaries[fileName]) return;
      setSummarizingFiles((prev) => new Set(prev).add(fileName));
      fileSummaryMutation.mutate(
        { owner, repo, prNumber, fileName },
        {
          onSuccess: (summary) => {
            setFileSummaries((prev) => ({ ...prev, [fileName]: summary }));
            setSummarizingFiles((prev) => {
              const next = new Set(prev);
              next.delete(fileName);
              return next;
            });
          },
          onError: () => {
            setSummarizingFiles((prev) => {
              const next = new Set(prev);
              next.delete(fileName);
              return next;
            });
          },
        },
      );
    },
    [owner, repo, prNumber, fileSummaryMutation, fileSummaries, summarizingFiles],
  );

  const renderHeaderMetadata = useCallback(
    (item: CodeViewItem<unknown>) => {
      if (item.type !== "diff") return null;
      const fileName = item.fileDiff.name;
      const summary = fileSummaries[fileName];
      const isSummarizing = summarizingFiles.has(fileName);

      return (
        <div data-diff-file-idx={files.findIndex((f) => f.fileName === fileName)} className="flex items-center gap-2">
          {summary ? (
            <span className="max-w-96 truncate text-xs text-[var(--muted-foreground)]" title={summary}>
              {summary}
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSummarizeFile(fileName);
              }}
              disabled={isSummarizing}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--diffshub-card-hover-bg)] disabled:opacity-50"
            >
              {isSummarizing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Summarize
            </button>
          )}
        </div>
      );
    },
    [fileSummaries, summarizingFiles, handleSummarizeFile, files],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--foreground)]" />
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)]">Pull request not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar — sticky to screen */}
      <div className="sticky top-0 flex h-screen w-80 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--diffshub-sidebar-bg)]">
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${
                (d.state as string) === "open"
                  ? "bg-green-900/50 text-green-400"
                  : (d.state as string) === "merged"
                    ? "bg-purple-900/50 text-purple-400"
                    : "bg-red-900/50 text-red-400"
              }`}
            >
              {(d.state as string) === "merged" ? "Merged" : (d.state as string)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">#{number}</span>
          </div>
          <h1 className="truncate text-sm font-semibold text-[var(--foreground)]">
            {d.title as string}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            {(d.authorAvatar as string) && (
              <Image
                src={d.authorAvatar as string}
                alt={d.authorName as string}
                width={16}
                height={16}
                className="rounded-full"
              />
            )}
            <span className="font-medium text-[var(--foreground)]">{d.authorName as string}</span>
            <span>into</span>
            <code className="bg-[var(--muted)] px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)]">
              {d.baseBranch as string}
            </code>
            <span>from</span>
            <code className="bg-[var(--muted)] px-1.5 py-0.5 text-[11px] text-[var(--muted-foreground)]">
              {d.headBranch as string}
            </code>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span>{(d.changedFiles as number)} files</span>
            <span className="text-[var(--diffshub-comment-add-fg)]">+{(d.additions as number)}</span>
            <span className="text-[var(--diffshub-comment-del-fg)]">-{(d.deletions as number)}</span>
          </div>
        </div>

        <AISummaryCard
          summary={summary}
          onGenerate={() => regenerateMutation.mutate({ owner, repo, prNumber })}
          isGenerating={regenerateMutation.isPending}
          label="AI Summary"
        />

        <div className="flex-1 overflow-hidden">
          <FileTreeSidebar
            files={files}
            activeFile={null}
            onFileSelect={handleFileSelect}
          />
        </div>
      </div>

      {/* Right Side — scrollable diff view */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--background)]">
        {diffItems.length > 0 ? (
          <ThemedCodeView
            initialItems={diffItems}
            options={{ stickyHeaders: true }}
            renderHeaderMetadata={renderHeaderMetadata}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted-foreground)]/70">
            No files changed
          </div>
        )}
      </div>
    </div>
  );
}
