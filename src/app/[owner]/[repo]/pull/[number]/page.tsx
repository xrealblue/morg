"use client";

import Image from "next/image";
import { use, useState, useCallback, useMemo } from "react";
import { api } from "~/trpc/react";
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
  params: Promise<{ owner: string; repo: string; number: string }>;
}

export default function PullRequestPage({ params }: Props) {
  const { owner, repo, number } = use(params);
  const prNumber = parseInt(number, 10);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const { data: pr, isLoading } = api.public.getPullRequest.useQuery({
    owner,
    repo,
    prNumber,
  });

  const files = useMemo(
    () => ((pr as unknown as Record<string, unknown>)?.files as FileChange[] | undefined) ?? [],
    [pr],
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

  if (!pr) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Pull request not found</p>
      </div>
    );
  }

  const d = pr as unknown as Record<string, unknown>;

  return (
    <div className="flex h-screen">
      <div className="flex w-80 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-4 py-3">
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
            <span className="text-xs text-zinc-500">#{number}</span>
          </div>
          <h1 className="truncate text-sm font-semibold text-zinc-100">
            {d.title as string}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
            {(d.authorAvatar as string) && (
              <Image
                src={d.authorAvatar as string}
                alt={d.authorName as string}
                width={16}
                height={16}
                className="rounded-full"
              />
            )}
            <span className="font-medium text-zinc-300">{d.authorName as string}</span>
            <span>into</span>
            <code className="bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-400">
              {d.baseBranch as string}
            </code>
            <span>from</span>
            <code className="bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-400">
              {d.headBranch as string}
            </code>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
            <span className="text-zinc-400">{(d.changedFiles as number)} files</span>
            <span className="text-emerald-400">+{(d.additions as number)}</span>
            <span className="text-red-400">-{(d.deletions as number)}</span>
          </div>
        </div>

        <AISummaryCard summary={(d.summary as string) ?? null} label="AI Summary" />

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
