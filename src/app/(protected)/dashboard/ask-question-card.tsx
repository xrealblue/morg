"use client";

import { useState } from "react";
import useProject from "~/hooks/use-project";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { Send, X } from "lucide-react";

export default function AskQuestionCard() {
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [filesReferences, setFilesReferences] = useState<
    Array<{ fileName: string; sourceCode: string; summary: string }>
  >([]);
  const { project } = useProject();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id || !question.trim()) return;

    setLoading(true);
    setAnswer("");
    setOpen(true);

    const { output, filesReferences: refs } = await askQuestion(
      question,
      project.id,
    );
    setFilesReferences(refs);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((prev) => prev + delta);
      }
    }
    setLoading(false);
  };

  return (
    <>
      {/* Answer Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => { setOpen(false); setAnswer(""); }}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Morg AI</h2>

            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-zinc-700">
              {answer || (loading && "Thinking...")}
            </div>

            {filesReferences.length > 0 && (
              <div className="mt-6 border-t border-zinc-200 pt-4">
                <h3 className="mb-2 text-sm font-medium text-zinc-500">
                  Referenced Files
                </h3>
                <div className="space-y-2">
                  {filesReferences.map((file) => (
                    <div
                      key={file.fileName}
                      className="rounded-lg bg-zinc-50 p-3"
                    >
                      <p className="text-sm font-medium text-zinc-800">
                        {file.fileName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {file.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Form */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          Ask about your code
        </h2>
        <form onSubmit={onSubmit} className="flex gap-3">
          <textarea
            placeholder="Which file should I edit to change the home page?"
            className="flex-1 resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex h-fit items-center gap-2 self-end rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Ask
          </button>
        </form>
      </div>
    </>
  );
}
