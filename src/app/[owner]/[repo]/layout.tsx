"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Search, Moon, Sun, Github } from "lucide-react";

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
    <div>
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-zinc-100">
              Morg
            </Link>
            <form onSubmit={handleSubmit} className="flex items-center">
              <div className="flex items-center border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="owner/repo"
                  className="ml-1.5 w-48 bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-600"
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:text-zinc-300"
            >
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:text-zinc-300"
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
