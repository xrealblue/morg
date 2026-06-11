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
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Commit not found</p>
      </div>
    );
  }

  const d = commit as unknown as Record<string, unknown>;
  const stats = (d.stats ?? {}) as Record<string, number>;

  return (
    <div className="flex h-screen">
      <div className="flex w-80 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2.5">
            {(d.commitAuthorAvatar as string) && (
              <img
                src={d.commitAuthorAvatar as string}
                alt={d.commitAuthorName as string}
                className="h-7 w-7 rounded-full"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-medium text-zinc-200">{d.commitAuthorName as string}</span>
              </div>
              <h1 className="truncate text-sm font-semibold text-zinc-100">
                {d.commitMessage as string}
              </h1>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
            <code className="font-mono text-zinc-400">{(d.commitHash as string)?.slice(0, 7)}</code>
            <span className="text-emerald-400">+{(stats.additions as number)}</span>
            <span className="text-red-400">-{(stats.deletions as number)}</span>
            <span>{(stats.total as number) ?? files.length} files</span>
          </div>
        </div>

        <AISummaryCard summary={(d.summary as string) ?? null} />

        <div className="flex-1 overflow-hidden">
          <FileTreeSidebar
            files={files}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-zinc-950">
        {activeFileData ? (
          <>
            <FileTabBar
              files={files}
              activeFile={activeFile}
              onFileSelect={handleFileSelect}
            />
            <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-1.5 text-xs text-zinc-500">
              <span className="font-medium text-zinc-300">{activeFileData.fileName}</span>
              <span className="text-emerald-400">+{activeFileData.additions}</span>
              <span className="text-red-400">-{activeFileData.deletions}</span>
              <span className="text-zinc-600">({activeFileData.status})</span>
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
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-600">
            Select a file to view its diff
          </div>
        )}
      </div>
    </div>
  );
}
