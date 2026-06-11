"use client";

import useProject from "~/hooks/use-project";
import AskQuestionCard from "../dashboard/ask-question-card";

export default function QAPage() {
  const { project } = useProject();

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-zinc-900">No project selected</h2>
        <p className="mt-2 text-zinc-500">
          Select a project from the sidebar to start asking questions
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Q&A</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ask questions about the {project.name} codebase
        </p>
      </div>

      <AskQuestionCard />
    </div>
  );
}
