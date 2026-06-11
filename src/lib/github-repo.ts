import { Octokit } from "octokit";
import { getCachedRepo, setCachedRepo } from "./cache";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface RepoInfo {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  ownerAvatar: string;
}

export async function getRepoInfo(
  owner: string,
  repo: string,
): Promise<RepoInfo> {
  const fullName = `${owner}/${repo}`;

  const cached = await getCachedRepo(fullName);
  if (cached) return cached.data as RepoInfo;

  const { data } = await octokit.rest.repos.get({ owner, repo });

  const info: RepoInfo = {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    language: data.language,
    topics: data.topics ?? [],
    defaultBranch: data.default_branch,
    ownerAvatar: data.owner?.avatar_url ?? "",
  };

  await setCachedRepo(fullName, info);

  return info;
}

export async function getRepoOverview(owner: string, repo: string) {
  const [repoInfo, commitsRes, pullsRes] = await Promise.all([
    getRepoInfo(owner, repo),
    octokit.rest.repos.listCommits({ owner, repo, per_page: 10 }),
    octokit.rest.pulls.list({ owner, repo, state: "all", per_page: 10 }),
  ]);

  return {
    repo: repoInfo,
    commits: commitsRes.data.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      authorName: c.commit.author?.name ?? "Unknown",
      authorAvatar: c.author?.avatar_url ?? "",
      date: c.commit.author?.date ?? new Date().toISOString(),
    })),
    pullRequests: pullsRes.data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? "merged" : pr.state,
      authorName: pr.user?.login ?? "Unknown",
      authorAvatar: pr.user?.avatar_url ?? "",
      createdAt: pr.created_at,
    })),
  };
}
