"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Search, Moon, Sun, Github } from "lucide-react";

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [dark, setDark] = useState(false);

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

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-zinc-900">
              Morg
            </Link>
            <form onSubmit={handleSubmit} className="flex items-center">
              <div className="flex items-center border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="owner/repo"
                  className="ml-1.5 w-48 bg-transparent text-xs text-zinc-700 outline-none placeholder:text-zinc-400"
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-zinc-700"
            >
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-zinc-700"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
