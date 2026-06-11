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
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">Commit not found</p>
        </div>
      </div>
    );
  }

  const d = commit as unknown as Record<string, unknown>;
  const stats = (d.stats ?? {}) as Record<string, number>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <a href={`/${owner}/${repo}`} className="text-sm text-zinc-400 hover:text-zinc-600">
          ← {owner}/{repo}
        </a>
      </div>

      <div className="space-y-4">
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

        <div className="flex gap-4">
          <div className="w-72 shrink-0">
            <FileTreeSidebar
              files={files}
              activeFile={activeFile}
              onFileSelect={handleFileSelect}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {activeFileData ? (
              <>
                <FileTabBar
                  files={files}
                  activeFile={activeFile}
                  onFileSelect={handleFileSelect}
                />
                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">{activeFileData.fileName}</span>
                  <span className="ml-3 text-emerald-600">+{activeFileData.additions}</span>
                  <span className="ml-1 text-red-600">-{activeFileData.deletions}</span>
                  <span className="ml-2 text-zinc-400">({activeFileData.status})</span>
                </div>
                <DiffViewer
                  original={parsedDiff.original}
                  modified={parsedDiff.modified}
                  filePath={activeFileData.fileName}
                />
              </>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 py-20 text-sm text-zinc-400">
                Select a file from the sidebar to view its diff
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
