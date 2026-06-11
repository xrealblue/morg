"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { DiffViewMode } from "./types";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => ({ default: mod.DiffEditor })),
  { ssr: false },
);

interface Props {
  original: string;
  modified: string;
  language?: string;
  filePath?: string;
}

function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    yml: "yaml",
    yaml: "yaml",
    toml: "toml",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    dockerfile: "dockerfile",
    graphql: "graphql",
    prisma: "prisma",
  };
  return map[ext ?? ""] ?? "plaintext";
}

export default function DiffViewer({ original, modified, language, filePath }: Props) {
  const [viewMode, setViewMode] = useState<DiffViewMode>("side-by-side");

  const lang = language ?? (filePath ? detectLanguage(filePath) : "plaintext");

  if (!original && !modified) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
        No diff available
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        {filePath && (
          <span className="text-sm font-medium text-zinc-400">{filePath}</span>
        )}
        <div className="flex items-center gap-1 bg-zinc-800 p-0.5">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1 text-xs font-medium transition ${
              viewMode === "side-by-side"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Side-by-side
          </button>
          <button
            onClick={() => setViewMode("unified")}
            className={`px-3 py-1 text-xs font-medium transition ${
              viewMode === "unified"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Unified
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <MonacoDiffEditor
          original={original}
          modified={modified}
          language={lang}
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: viewMode === "side-by-side",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            diffWordWrap: "on",
            fontSize: 13,
            tabSize: 2,
            folding: false,
            renderOverviewRuler: false,
            fontFamily: "Berkeley Mono, ui-monospace, monospace",
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
}
