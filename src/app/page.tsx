"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "~/lib/auth-client";
import { ArrowRight, Github, Sparkles, Search, GitCommit, GitPullRequest } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [repoUrl, setRepoUrl] = useState("");

  const handleExplore = () => {
    const match = repoUrl.match(/github\.com\/([\w.-]+\/[\w.-]+)/);
    if (match) {
      window.location.href = `/${match[1]}`;
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-zinc-950">
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform blur-[10px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg, #000 0%, #000 7%, transparent 10%, transparent 12%, #000 16%), repeating-linear-gradient(100deg, #3b82f6 10%, #818cf8 15%, #93c5fd 20%, #c4b5fd 25%, #60a5fa 30%)",
            backgroundSize: "300% 200%",
            animation: "aurora 60s linear infinite",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center gap-6 px-4 pt-24 text-center"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <Sparkles className="h-4 w-4" />
          AI-Powered Code Analysis
        </div>

        <h1 className="max-4xl text-4xl font-bold tracking-tight text-white md:text-7xl">
          Understand your codebase{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            instantly
          </span>
        </h1>

        <p className="max-w-2xl text-lg text-white/60 md:text-xl">
          Explore any public GitHub repository — browse commits, pull requests,
          and code diffs with AI-powered summaries. No login required.
        </p>

        <div className="mt-4 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
          <div className="flex items-center gap-2 pl-3">
            <Search className="h-4 w-4 text-white/40" />
          </div>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExplore()}
            placeholder="Enter a GitHub URL (e.g. facebook/react)"
            className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={handleExplore}
            disabled={!repoUrl}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            Explore
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <GitCommit className="h-4 w-4" />
            Commit diffs
          </span>
          <span className="flex items-center gap-1.5">
            <GitPullRequest className="h-4 w-4" />
            PR reviews
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            AI summaries
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 mt-12 flex items-center gap-4"
      >
        <Link
          href={session ? "/dashboard" : "/sign-in"}
          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
        >
          {session ? "Go to Dashboard" : "Get Started"}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="https://github.com/xrealblue/morg"
          target="_blank"
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          <Github className="h-4 w-4" />
          GitHub
        </Link>
      </motion.div>

      {session && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 mt-4 text-sm text-white/50"
        >
          Welcome back, {session.user.name}
        </motion.p>
      )}
    </main>
  );
}
