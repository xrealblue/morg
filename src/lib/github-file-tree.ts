import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  mode: string;
  sha: string;
  size: number | null;
}

const treeCache = new Map<string, { data: TreeItem[]; expiry: number }>();
const TREE_TTL = 1000 * 60 * 5;

export async function getRepoFileTree(
  owner: string,
  repo: string,
  ref = "HEAD",
): Promise<TreeItem[]> {
  const cacheKey = `${owner}/${repo}/${ref}`;

  const cached = treeCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: ref,
    recursive: "1",
  });

  const items: TreeItem[] = (data.tree ?? []).map((item) => ({
    path: item.path ?? "",
    type: (item.type as "blob" | "tree") ?? "blob",
    mode: item.mode ?? "100644",
    sha: item.sha ?? "",
    size: item.size ?? null,
  }));

  treeCache.set(cacheKey, { data: items, expiry: Date.now() + TREE_TTL });

  return items;
}

export function buildFileTree(items: TreeItem[]) {
  const root: Record<string, unknown> = {};

  for (const item of items) {
    const parts = item.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLast = i === parts.length - 1;

      if (isLast) {
        current[part] = { type: item.type, sha: item.sha, size: item.size };
      } else {
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
    }
  }

  return root;
}
