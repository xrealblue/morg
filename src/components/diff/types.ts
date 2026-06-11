export interface FileChange {
  fileName: string;
  status: "added" | "modified" | "removed" | "renamed";
  additions: number;
  deletions: number;
  patch: string | null;
  aiSummary?: string | null;
  aiSummaryGeneratedAt?: string | null;
}

export interface CommitDetail {
  hash: string;
  message: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  stats: { total: number; additions: number; deletions: number };
  summary: string;
  files: FileChange[];
}

export interface PRDetail {
  prNumber: number;
  title: string;
  body: string | null;
  state: string;
  authorName: string;
  authorAvatar: string | null;
  baseBranch: string;
  headBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
  files: FileChange[];
}

export type DiffViewMode = "side-by-side" | "unified";
