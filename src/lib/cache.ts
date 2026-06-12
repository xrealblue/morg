import { db } from "~/server/db";

const TTL = {
  REPO_METADATA: 1000 * 60 * 60,
  COMMIT_LIST: 1000 * 60 * 2,
  PR_LIST: 1000 * 60 * 2,
  PR_METADATA: 1000 * 60 * 5,
  COMMIT_DIFF: Infinity,
  PR_DIFF: Infinity,
  AI_SUMMARY: Infinity,
} as const;

function isFresh(cachedAt: Date, ttl: number): boolean {
  if (ttl === Infinity) return true;
  return Date.now() - cachedAt.getTime() < ttl;
}

export async function getCachedCommit(
  fullName: string,
  sha: string,
): Promise<{ data: unknown; summary: string | null } | null> {
  const cached = await db.commitCache.findUnique({
    where: { fullName_sha: { fullName, sha } },
  });
  if (!cached) return null;
  if (!isFresh(cached.cachedAt, TTL.COMMIT_DIFF)) return null;
  return { data: cached.data, summary: cached.summary };
}

export async function setCachedCommit(
  fullName: string,
  sha: string,
  data: unknown,
  summary?: string,
) {
  await db.commitCache.upsert({
    where: { fullName_sha: { fullName, sha } },
    create: { fullName, sha, data: data as object, summary },
    update: { data: data as object, summary, cachedAt: new Date() },
  });
}

export async function getCachedPR(
  fullName: string,
  prNumber: number,
): Promise<{ data: unknown; summary: string | null } | null> {
  const cached = await db.pullRequestCache.findUnique({
    where: { fullName_prNumber: { fullName, prNumber } },
  });
  if (!cached) return null;
  if (!isFresh(cached.cachedAt, TTL.PR_DIFF)) return null;
  return { data: cached.data, summary: cached.summary };
}

export async function setCachedPR(
  fullName: string,
  prNumber: number,
  data: unknown,
  summary?: string,
) {
  await db.pullRequestCache.upsert({
    where: { fullName_prNumber: { fullName, prNumber } },
    create: { fullName, prNumber, data: data as object, summary },
    update: { data: data as object, summary, cachedAt: new Date() },
  });
}

export async function getCachedRepo(
  fullName: string,
): Promise<{ data: unknown } | null> {
  const cached = await db.repoCache.findUnique({
    where: { fullName },
  });
  if (!cached) return null;
  if (!isFresh(cached.cachedAt, TTL.REPO_METADATA)) return null;
  return { data: cached.data };
}

export async function setCachedRepo(fullName: string, data: unknown) {
  await db.repoCache.upsert({
    where: { fullName },
    create: { fullName, owner: fullName.split("/")[0]!, repo: fullName.split("/")[1]!, data: data as object },
    update: { data: data as object, cachedAt: new Date() },
  });
}

const LIST_PREFIX = "list:commits:";

export async function getCachedCommitList(
  fullName: string,
): Promise<{ data: unknown } | null> {
  const cached = await db.commitCache.findUnique({
    where: { fullName_sha: { fullName, sha: LIST_PREFIX } },
  });
  if (!cached) return null;
  if (!isFresh(cached.cachedAt, TTL.COMMIT_LIST)) return null;
  return { data: cached.data };
}

export async function setCachedCommitList(fullName: string, data: unknown) {
  await db.commitCache.upsert({
    where: { fullName_sha: { fullName, sha: LIST_PREFIX } },
    create: { fullName, sha: LIST_PREFIX, data: data as object },
    update: { data: data as object, cachedAt: new Date() },
  });
}

export async function invalidateCommitList(fullName: string) {
  await db.commitCache.deleteMany({
    where: { fullName, sha: LIST_PREFIX },
  }).catch(() => {});
}
