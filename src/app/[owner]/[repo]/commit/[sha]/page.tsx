"use client";

import { use, useState, useCallback, useMemo } from "react";
import { api } from "~/trpc/react";
import CommitHeader from "~/components/diff/commit-header";
import AISummaryCard from "~/components/diff/ai-summary-card";
import FileTreeSidebar from "~/components/diff/file-tree-sidebar";
import FileTabBar from "~/components/diff/file-tab-bar";
import DiffViewer from "~/components/diff/diff-viewer";
import type { FileChange } from "~/components/diff/types";

function parsePatch(patch: string | null): { original: string; modified: string } {
  if (!patch) return { original: "", modified: "" };
  const originalLines: string[] = [];
  const modifiedLines: string[] = [];
  for (const line of patch.split("\n")) {
    if (line.startsWith("@@")) continue;
    if (line.startsWith("-") && !line.startsWith("---")) {
      originalLines.push(line.slice(1));
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      modifiedLines.push(line.slice(1));
    } else if (!line.startsWith("---") && !line.startsWith("+++")) {
      originalLines.push(line);
      modifiedLines.push(line);
    }
  }
  return { original: originalLines.join("\n"), modified: modifiedLines.join("\n") };
}

interface Props {
  params: Promise<{ owner: string; repo: string; sha: string }>;
}

export default function CommitPage({ params }: Props) {
  const { owner, repo, sha } = use(params);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const { data: commit, isLoading } = api.public.getCommit.useQuery({
    owner,
    repo,
    sha,
  });

  const files = useMemo(
    () => ((commit as unknown as Record<string, unknown>)?.files as FileChange[] | undefined) ?? [],
    [commit],
  );

  const activeFileData = useMemo(
    () => files.find((f) => f.fileName === activeFile),
    [files, activeFile],
  );

  const parsedDiff = useMemo(
    () => (activeFileData ? parsePatch(activeFileData.patch) : { original: "", modified: "" }),
    [activeFileData],
  );

  const handleFileSelect = useCallback((fileName: string) => {
    setActiveFile(fileName);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-48px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="flex h-[calc(100vh-48px)] items-center justify-center">
        <p className="text-zinc-500">Commit not found</p>
      </div>
    );
  }

  const d = commit as unknown as Record<string, unknown>;
  const stats = (d.stats ?? {}) as Record<string, number>;

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col">
      <CommitHeader
        authorName={(d.authorName as string) ?? ""}
        authorAvatar={(d.authorAvatar as string) ?? ""}
        hash={(d.commitHash as string) ?? sha}
        message={(d.commitMessage as string) ?? ""}
        totalFiles={(stats.total as number) ?? files.length}
        additions={(stats.additions as number) ?? 0}
        deletions={(stats.deletions as number) ?? 0}
        date={(d.commitDate as string) ?? ""}
      />

      <AISummaryCard summary={(d.summary as string) ?? null} />

      <div className="flex min-h-0 flex-1 border-t border-zinc-200">
        <div className="w-80 shrink-0 border-r border-zinc-200">
          <FileTreeSidebar
            files={files}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {activeFileData ? (
            <>
              <FileTabBar
                files={files}
                activeFile={activeFile}
                onFileSelect={handleFileSelect}
              />
              <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-1.5 text-xs text-zinc-500">
                <span className="font-medium text-zinc-700">{activeFileData.fileName}</span>
                <span className="text-emerald-600">+{activeFileData.additions}</span>
                <span className="text-red-600">-{activeFileData.deletions}</span>
                <span className="text-zinc-400">({activeFileData.status})</span>
              </div>
              <div className="min-h-0 flex-1">
                <DiffViewer
                  original={parsedDiff.original}
                  modified={parsedDiff.modified}
                  filePath={activeFileData.fileName}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
              Select a file to view its diff
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
