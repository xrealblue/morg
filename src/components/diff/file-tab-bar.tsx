import { X } from "lucide-react";
import type { FileChange } from "./types";

interface Props {
  files: FileChange[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onFileClose?: (fileName: string) => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "added":
      return "border-l-emerald-500";
    case "modified":
      return "border-l-yellow-500";
    case "removed":
      return "border-l-red-500";
    default:
      return "border-l-zinc-300";
  }
}

export default function FileTabBar({ files, activeFile, onFileSelect, onFileClose }: Props) {
  if (files.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto border-b border-zinc-200 bg-zinc-50">
      {files.map((file) => (
        <button
          key={file.fileName}
          onClick={() => onFileSelect(file.fileName)}
          className={`flex items-center gap-1.5 border-r border-zinc-200 px-3 py-1.5 text-xs transition ${
            activeFile === file.fileName
              ? `bg-white text-zinc-900 shadow-[inset_0_-1px_0_0_#fff]`
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          }`}
        >
          <span className="max-w-[160px] truncate">
            {file.fileName.split("/").pop()}
          </span>
          {onFileClose && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onFileClose(file.fileName);
              }}
              className="ml-1 p-0.5 hover:bg-zinc-200"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
