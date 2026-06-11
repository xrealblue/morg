"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import type { DiffViewMode } from "./types";
import type { Monaco } from "@monaco-editor/react";

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

const MONOKAI_NIGHT_THEME = "monokai-night";

function defineMonokaiNight(m: Monaco) {
  m.editor.defineTheme(MONOKAI_NIGHT_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Base
      { token: "", foreground: "CCCCCC", background: "1E1E2E" },
      // Comments
      { token: "comment", foreground: "666688", fontStyle: "italic" },
      { token: "comment.doc", foreground: "8888AA", fontStyle: "italic" },
      // Keywords (pink/red — the Monokai Night signature)
      { token: "keyword", foreground: "F92672" },
      { token: "keyword.control", foreground: "F92672" },
      { token: "storage", foreground: "F92672" },
      { token: "storage.type", foreground: "66D9EF", fontStyle: "italic" },
      // Strings (yellow)
      { token: "string", foreground: "E6DB74" },
      { token: "string.template", foreground: "E6DB74" },
      // Numbers & constants (purple)
      { token: "number", foreground: "AE81FF" },
      { token: "constant.numeric", foreground: "AE81FF" },
      { token: "constant.language", foreground: "AE81FF" },
      { token: "constant.character", foreground: "AE81FF" },
      // Functions (green)
      { token: "entity.name.function", foreground: "A6E22E" },
      { token: "support.function", foreground: "66D9EF" },
      // Types & classes (cyan, italic)
      { token: "entity.name.type", foreground: "66D9EF", fontStyle: "italic" },
      { token: "entity.name.class", foreground: "66D9EF", fontStyle: "italic" },
      { token: "support.type", foreground: "66D9EF", fontStyle: "italic" },
      { token: "support.class", foreground: "66D9EF", fontStyle: "italic" },
      // Variables
      { token: "variable", foreground: "CCCCCC" },
      { token: "variable.parameter", foreground: "FD971F", fontStyle: "italic" },
      { token: "variable.language", foreground: "F92672" },
      // Tags (HTML/JSX)
      { token: "entity.name.tag", foreground: "F92672" },
      { token: "meta.tag", foreground: "CCCCCC" },
      // Attributes
      { token: "entity.other.attribute-name", foreground: "A6E22E" },
      // Operators & punctuation
      { token: "keyword.operator", foreground: "F92672" },
      { token: "punctuation", foreground: "CCCCCC" },
      // Imports / modules
      { token: "entity.name.module", foreground: "CCCCCC" },
      { token: "support.module", foreground: "CCCCCC" },
    ],
    colors: {
      // Editor core — true Monokai Night background
      "editor.background": "#040404",
      "editor.foreground": "#040404",
      "editorCursor.foreground": "#F8F8F0",
      "editor.lineHighlightBackground": "#040404",
      "editor.selectionBackground": "#49483E",
      "editor.inactiveSelectionBackground": "#3A3A4E",
      "editor.selectionHighlightBackground": "#49483E80",
      "editor.wordHighlightBackground": "#49483E80",
      "editor.wordHighlightStrongBackground": "#49483E99",
      // Line numbers
      "editorLineNumber.foreground": "#fff",
      "editorLineNumber.activeForeground": "#9999BB",
      // Gutter diff indicators
      "editorGutter.background": "#040404",
      "editorGutter.addedBackground": "#A6E22E88",
      "editorGutter.modifiedBackground": "#66D9EF88",
      "editorGutter.deletedBackground": "#F9267288",
      // Diff highlighting (subtle, true to the theme)
      "diffEditor.insertedTextBackground": "#A6E22E15",
      "diffEditor.removedTextBackground": "#F9267215",
      "diffEditor.insertedLineBackground": "#00ECA930", // green bg — new/added lines
      "diffEditor.removedLineBackground": "#FF000040",
      "diffEditor.diagonalFill": "#44444460",
      // Brackets
      "editorBracketMatch.background": "#2D2D44",
      "editorBracketMatch.border": "#66668880",
      // Scrollbar
      "scrollbarSlider.background": "#44445A99",
      "scrollbarSlider.hoverBackground": "#555577BB",
      "scrollbarSlider.activeBackground": "#6666888A",
      // Overview ruler
      "editorOverviewRuler.addedForeground": "#A6E22E88",
      "editorOverviewRuler.deletedForeground": "#F9267288",
      "editorOverviewRuler.modifiedForeground": "#66D9EF88",
    },
  });
}

export default function DiffViewer({ original, modified, language, filePath }: Props) {
  const [viewMode, setViewMode] = useState<DiffViewMode>("side-by-side");

  const lang = language ?? (filePath ? detectLanguage(filePath) : "plaintext");

  const handleBeforeMount = useCallback((m: Monaco) => {
    defineMonokaiNight(m);
  }, []);

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
        {filePath && <span className="text-sm font-medium text-zinc-400">{filePath}</span>}
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
          theme={MONOKAI_NIGHT_THEME}
          beforeMount={handleBeforeMount}
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
