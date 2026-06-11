import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { Folder, File, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ owner: string; repo: string; branch: string }>;
}

export default async function FileTreePage({ params }: Props) {
  const { owner, repo, branch } = await params;

  const ctx = await createTRPCContext({ headers: await headers() });
  const caller = createCaller(ctx);

  try {
    const tree = await caller.public.getFileTree({ owner, repo, ref: branch });
    const dirs = tree.filter((i) => i.type === "tree").sort((a, b) => a.path.localeCompare(b.path));
    const files = tree.filter((i) => i.type === "blob").sort((a, b) => a.path.localeCompare(b.path));

    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <a href={`/${owner}/${repo}`} className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
            ← {owner}/{repo}
          </a>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-lg text-zinc-800 dark:text-zinc-200">{branch}</code>
          </h1>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {tree.length} items
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {dirs.slice(0, 100).map((item) => (
              <div key={item.path} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <Folder className="h-4 w-4 text-blue-400" />
                <span className="text-zinc-700 dark:text-zinc-300">{item.path}</span>
              </div>
            ))}
            {files.slice(0, 200).map((item) => (
              <div key={item.path} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <File className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400">{item.path}</span>
                {item.size != null && (
                  <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
                    {item.size > 1024 ? `${(item.size / 1024).toFixed(1)} KB` : `${item.size} B`}
                  </span>
                )}
              </div>
            ))}
          </div>

          {(dirs.length > 100 || files.length > 200) && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 text-center text-sm text-zinc-400 dark:text-zinc-500">
              Showing first 300 items. Full tree available via API.
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
