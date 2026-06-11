"use client";

import { useMemo } from "react";
import { useFileTree } from "@pierre/trees/react";
import type { GitStatusEntry } from "@pierre/trees";
import { ThemedFileTree } from "~/components/theming/react/ThemedFileTree";
import type { FileChange } from "./types";

interface Props {
  files: FileChange[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
}

export default function FileTreeSidebar({ files, activeFile, onFileSelect }: Props) {
  const paths = useMemo(() => files.map((f) => f.fileName), [files]);

  const gitStatus = useMemo(() => {
    const statusMap: Record<string, string> = {
      added: "added",
      modified: "modified",
      removed: "deleted",
      renamed: "renamed",
    };
    return files.map((f) => ({
      path: f.fileName,
      status: statusMap[f.status] as GitStatusEntry["status"],
    }));
  }, [files]);

  const { model } = useFileTree({
    paths,
    initialExpansion: "open",
    gitStatus,
    initialSelectedPaths: activeFile ? [activeFile] : undefined,
    onSelectionChange: (selected) => {
      const last = selected[selected.length - 1];
      if (last != null) {
        onFileSelect(last);
      }
    },
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-4 py-2">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Files Changed
          <span className="ml-2 font-normal text-[var(--muted-foreground)]/70">({files.length})</span>
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ThemedFileTree model={model} />
      </div>
    </div>
  );
}
