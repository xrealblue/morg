"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Search, Github } from "lucide-react";

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const url = repoUrl.replace(/\/+$/, "").replace(/\.git$/, "");
      const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
      if (match) {
        router.push(`/${match[1]}`);
      }
    },
    [repoUrl, router],
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--diffshub-sidebar-bg)]">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-berkeley-mono)" }}>
              Morg
            </Link>
            <form onSubmit={handleSubmit} className="flex items-center">
              <div className="flex items-center border border-[var(--color-border)] bg-[var(--muted)] px-2.5 py-1 text-xs">
                <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="owner/repo"
                  className="ml-1.5 w-48 bg-transparent text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]/70"
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
