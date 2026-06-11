-- AlterTable
ALTER TABLE "Commit" ADD COLUMN     "rawDiff" TEXT;

-- CreateTable
CREATE TABLE "RepoCache" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepoCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitCache" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "summary" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequestCache" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "summary" TEXT,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PullRequestCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commitId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "patch" TEXT,
    "aiSummary" TEXT,
    "aiSummaryGeneratedAt" TIMESTAMP(3),

    CONSTRAINT "CommitFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "baseBranch" TEXT NOT NULL,
    "headBranch" TEXT NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changedFiles" INTEGER NOT NULL DEFAULT 0,
    "mergedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "aiSummary" TEXT,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequestFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pullRequestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "patch" TEXT,
    "aiSummary" TEXT,
    "aiSummaryGeneratedAt" TIMESTAMP(3),

    CONSTRAINT "PullRequestFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepoCache_fullName_key" ON "RepoCache"("fullName");

-- CreateIndex
CREATE INDEX "RepoCache_owner_repo_idx" ON "RepoCache"("owner", "repo");

-- CreateIndex
CREATE INDEX "CommitCache_fullName_idx" ON "CommitCache"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "CommitCache_fullName_sha_key" ON "CommitCache"("fullName", "sha");

-- CreateIndex
CREATE INDEX "PullRequestCache_fullName_idx" ON "PullRequestCache"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequestCache_fullName_prNumber_key" ON "PullRequestCache"("fullName", "prNumber");

-- CreateIndex
CREATE INDEX "CommitFile_commitId_idx" ON "CommitFile"("commitId");

-- CreateIndex
CREATE INDEX "CommitFile_commitId_fileName_idx" ON "CommitFile"("commitId", "fileName");

-- CreateIndex
CREATE INDEX "PullRequest_projectId_idx" ON "PullRequest"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_projectId_prNumber_key" ON "PullRequest"("projectId", "prNumber");

-- CreateIndex
CREATE INDEX "PullRequestFile_pullRequestId_idx" ON "PullRequestFile"("pullRequestId");

-- AddForeignKey
ALTER TABLE "CommitFile" ADD CONSTRAINT "CommitFile_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequestFile" ADD CONSTRAINT "PullRequestFile_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
