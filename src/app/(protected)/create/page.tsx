"use client";

import { api } from "~/trpc/react";
import { Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useRefetch from "~/hooks/use-refetch";

interface FormInput {
  repoUrl: string;
  projectName: string;
  githubToken: string;
}

export default function CreateProjectPage() {
  const { register, handleSubmit, reset, setValue } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  const onSubmit = (data: FormInput) => {
    createProject.mutate(
      {
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          void refetch();
          reset();
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-zinc-100 p-3">
            <Github className="h-6 w-6 text-zinc-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Link Repository</h1>
            <p className="text-sm text-zinc-500">
              Connect a GitHub repo to start analyzing
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Project Name
            </label>
            <input
              {...register("projectName", { required: true })}
              type="text"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              placeholder="My Awesome Project"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              GitHub Repository URL
            </label>
            <input
              {...register("repoUrl", { required: true })}
              type="url"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              placeholder="https://github.com/user/repo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              GitHub Token{" "}
              <span className="text-zinc-400">(optional, for private repos)</span>
            </label>
            <input
              {...register("githubToken")}
              type="password"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              placeholder="ghp_xxxxx"
            />
          </div>

          <button
            type="submit"
            disabled={createProject.isPending}
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {createProject.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </span>
            ) : (
              "Create Project"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
