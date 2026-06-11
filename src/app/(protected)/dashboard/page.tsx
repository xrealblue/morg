"use client";

import useProject from "~/hooks/use-project";
import { Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";

export default function DashboardPage() {
  const { project } = useProject();

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-zinc-900">No project selected</h2>
        <p className="mt-2 text-zinc-500">
          Select a project from the sidebar or{" "}
          <Link href="/create" className="text-blue-600 underline">
            create a new one
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GitHub Link */}
      <Link
        href={project.githubUrl}
        target="_blank"
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
      >
        <Github className="h-4 w-4" />
        Linked to {project.githubUrl}
      </Link>

      {/* Ask Question */}
      <AskQuestionCard />

      {/* Commit Log */}
      <CommitLog />
    </div>
  );
}
