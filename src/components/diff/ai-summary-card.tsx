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
    <div className="border-b border-zinc-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium text-zinc-700">{label}</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-6 pb-3 pt-2.5">
          {summary ? (
            <div className="space-y-2">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-600">
                {summary}
              </pre>
              {onGenerate && (
                <button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50"
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
              className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate AI Summary
                </>
              )}
            </button>
          ) : (
            <p className="text-xs text-zinc-400">No summary available.</p>
          )}
        </div>
      )}
    </div>
  );
}
