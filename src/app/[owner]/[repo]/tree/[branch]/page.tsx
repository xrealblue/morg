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
          <a href={`/${owner}/${repo}`} className="text-sm text-zinc-400 hover:text-zinc-600">
            ← {owner}/{repo}
          </a>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            <code className="rounded-md bg-zinc-100 px-2 py-0.5 text-lg">{branch}</code>
          </h1>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-4 py-3">
            <span className="text-sm font-medium text-zinc-700">
              {tree.length} items
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {dirs.slice(0, 100).map((item) => (
              <div key={item.path} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50">
                <Folder className="h-4 w-4 text-blue-400" />
                <span className="text-zinc-700">{item.path}</span>
              </div>
            ))}
            {files.slice(0, 200).map((item) => (
              <div key={item.path} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-50">
                <File className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-600">{item.path}</span>
                {item.size != null && (
                  <span className="ml-auto text-xs text-zinc-400">
                    {item.size > 1024 ? `${(item.size / 1024).toFixed(1)} KB` : `${item.size} B`}
                  </span>
                )}
              </div>
            ))}
          </div>

          {(dirs.length > 100 || files.length > 200) && (
            <div className="border-t border-zinc-100 px-4 py-3 text-center text-sm text-zinc-400">
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
