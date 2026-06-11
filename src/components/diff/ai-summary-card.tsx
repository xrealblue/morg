"use client";

import { Sparkles, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useState } from "react";

interface Props {
  summary: string | null;
  onGenerate?: () => void;
  isGenerating?: boolean;
  label?: string;
}

export default function AISummaryCard({
  summary,
  onGenerate,
  isGenerating = false,
  label = "AI Summary",
}: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-zinc-700">{label}</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
          {summary ? (
            <div className="space-y-2">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                {summary}
              </pre>
              {onGenerate && (
                <button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  Regenerate
                </button>
              )}
            </div>
          ) : onGenerate ? (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Summary
                </>
              )}
            </button>
          ) : (
            <p className="text-sm text-zinc-400">No summary available.</p>
          )}
        </div>
      )}
    </div>
  );
}
