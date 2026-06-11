import { X } from "lucide-react";
import type { FileChange } from "./types";

interface Props {
  files: FileChange[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onFileClose?: (fileName: string) => void;
}

export default function FileTabBar({ files, activeFile, onFileSelect, onFileClose }: Props) {
  if (files.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto border-b border-border bg-muted">
      {files.map((file) => (
        <button
          key={file.fileName}
          onClick={() => onFileSelect(file.fileName)}
          className={`flex items-center gap-1.5 border-r border-border px-3 py-1.5 text-xs transition ${
            activeFile === file.fileName
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
              className="ml-1 p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
