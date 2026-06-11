"use client";

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

  const files = ((pr as unknown as Record<string, unknown>)?.files as FileChange[] | undefined) ?? [];

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

  if (!pr) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500">Pull request not found</p>
        </div>
      </div>
    );
  }

  const d = pr as unknown as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <a href={`/${owner}/${repo}`} className="text-sm text-zinc-400 hover:text-zinc-600">
          ← {owner}/{repo}
        </a>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium ${
                    (d.state as string) === "open"
                      ? "bg-green-50 text-green-700"
                      : (d.state as string) === "merged"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {(d.state as string) === "merged" ? "Merged" : (d.state as string)}
                </span>
                <span className="text-sm text-zinc-400">#{number}</span>
              </div>
              <h1 className="mt-2 text-xl font-semibold text-zinc-900">
                {d.title as string}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
                {(d.authorAvatar as string) && (
                  <img
                    src={d.authorAvatar as string}
                    alt={d.authorName as string}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="font-medium text-zinc-700">{d.authorName as string}</span>
                <span>wants to merge into</span>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
                  {d.baseBranch as string}
                </code>
                <span>from</span>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
                  {d.headBranch as string}
                </code>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-4 text-sm">
            <span className="text-zinc-500">
              <strong className="text-zinc-700">{d.changedFiles as number}</strong> files changed
            </span>
            <span className="text-emerald-600">+<strong>{d.additions as number}</strong></span>
            <span className="text-red-600">-<strong>{d.deletions as number}</strong></span>
          </div>
        </div>

        <AISummaryCard summary={(d.summary as string) ?? null} label="PR AI Summary" />

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
