import { File, Folder, Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import type { FileChange } from "./types";

interface Props {
  files: FileChange[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "added":
      return <Plus className="h-3.5 w-3.5 text-emerald-500" />;
    case "modified":
      return <Pencil className="h-3.5 w-3.5 text-yellow-500" />;
    case "removed":
      return <Trash2 className="h-3.5 w-3.5 text-red-500" />;
    case "renamed":
      return <ArrowRight className="h-3.5 w-3.5 text-blue-500" />;
    default:
      return <File className="h-3.5 w-3.5 text-zinc-400" />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "added":
      return "text-emerald-600";
    case "modified":
      return "text-yellow-600";
    case "removed":
      return "text-red-600";
    default:
      return "text-zinc-600";
  }
}

function groupByDirectory(files: FileChange[]): Record<string, FileChange[]> {
  const grouped: Record<string, FileChange[]> = {};
  for (const file of files) {
    const parts = file.fileName.split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : "/";
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(file);
  }
  return grouped;
}

export default function FileTreeSidebar({ files, activeFile, onFileSelect }: Props) {
  const grouped = groupByDirectory(files);
  const dirs = Object.keys(grouped)
    .filter((d) => d !== "/")
    .sort();
  const rootFiles = grouped["/"] ?? [];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-700">
          Files
          <span className="ml-2 text-xs font-normal text-zinc-400">
            ({files.length})
          </span>
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {dirs.map((dir) => (
          <div key={dir} className="mb-1">
            <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500">
              <Folder className="h-3.5 w-3.5" />
              <span>{dir}</span>
            </div>
            <div className="ml-4">
              {grouped[dir]?.map((file) => (
                <button
                  key={file.fileName}
                  onClick={() => onFileSelect(file.fileName)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                    activeFile === file.fileName
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {getStatusIcon(file.status)}
                  <span className="flex-1 truncate">
                    {file.fileName.split("/").pop()}
                  </span>
                  <span className={`shrink-0 text-[10px] ${getStatusColor(file.status)}`}>
                    {file.additions > 0 && `+${file.additions}`}
                    {file.additions > 0 && file.deletions > 0 && " "}
                    {file.deletions > 0 && `-${file.deletions}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {rootFiles.map((file) => (
          <button
            key={file.fileName}
            onClick={() => onFileSelect(file.fileName)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
              activeFile === file.fileName
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            {getStatusIcon(file.status)}
            <span className="flex-1 truncate">{file.fileName}</span>
            <span className={`shrink-0 text-[10px] ${getStatusColor(file.status)}`}>
              {file.additions > 0 && `+${file.additions}`}
              {file.additions > 0 && file.deletions > 0 && " "}
              {file.deletions > 0 && `-${file.deletions}`}
            </span>
          </button>
        ))}
        {files.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-zinc-400">
            No files changed
          </p>
        )}
      </div>
    </div>
  );
}
