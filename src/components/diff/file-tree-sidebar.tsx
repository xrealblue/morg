import { useState, useCallback, useMemo } from "react";
import { ChevronRight, ChevronDown, File, Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
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

interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  children: TreeNode[];
  file?: FileChange;
}

function buildTree(files: FileChange[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const parts = file.fileName.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isFile = i === parts.length - 1;
      const existing = current.find((n) => n.name === part);
      if (existing) {
        if (isFile) {
          existing.file = file;
          existing.type = "blob";
        }
        current = existing.children;
      } else {
        const node: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: isFile ? "blob" : "tree",
          children: [],
          file: isFile ? file : undefined,
        };
        current.push(node);
        current = node.children;
      }
    }
  }
  return root;
}

function TreeNodeRow({
  node,
  depth,
  activeFile,
  onFileSelect,
}: {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isActive = node.file && activeFile === node.file.fileName;

  const handleClick = useCallback(() => {
    if (node.type === "tree") {
      setExpanded((p) => !p);
    } else if (node.file) {
      onFileSelect(node.file.fileName);
    }
  }, [node, onFileSelect]);

  const status = node.file?.status;

  return (
    <div>
      <button
        onClick={handleClick}
        className={`flex w-full items-center gap-1 px-1 py-1 text-left text-xs transition ${
          isActive
            ? "bg-blue-500/20 text-zinc-100"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {node.type === "tree" ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        {node.type === "tree" ? (
          <FolderIcon expanded={expanded} />
        ) : (
          status ? getStatusIcon(status) : <FileIcon />
        )}
        <span className="flex-1 truncate">{node.name}</span>
        {node.file && (
          <span className="shrink-0 text-[10px]">
            {node.file.additions > 0 && (
              <span className="text-emerald-400">+{node.file.additions}</span>
            )}
            {node.file.additions > 0 && node.file.deletions > 0 && " "}
            {node.file.deletions > 0 && (
              <span className="text-red-400">-{node.file.deletions}</span>
            )}
          </span>
        )}
      </button>
      {node.type === "tree" && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FolderIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
      {expanded ? (
        <path d="M.5 3.5a1 1 0 0 1 1-1h3.672a1 1 0 0 1 .707.293l.828.828A1 1 0 0 0 7.414 4H13.5a1 1 0 0 1 1 1v1.5a.5.5 0 0 1-.5.5H1a1 1 0 0 1-1-1V3.5Z" opacity="0.8" />
      ) : (
        <path d="M.5 4a1 1 0 0 1 1-1h3.672a1 1 0 0 1 .707.293l.828.828A1 1 0 0 0 7.414 4H13.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H1.5a1 1 0 0 1-1-1V4Z" opacity="0.8" />
      )}
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-zinc-500" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25V1.75Z" />
    </svg>
  );
}

export default function FileTreeSidebar({ files, activeFile, onFileSelect }: Props) {
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-2">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Files Changed
          <span className="ml-2 font-normal text-zinc-600">({files.length})</span>
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <TreeNodeRow
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
          />
        ))}
        {files.length === 0 && (
          <p className="px-4 py-4 text-center text-xs text-zinc-600">
            No files changed
          </p>
        )}
      </div>
    </div>
  );
}
