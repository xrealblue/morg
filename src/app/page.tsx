"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "~/lib/auth-client";
import { ArrowRight, Github, Sparkles } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950">
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
        className="relative z-10 flex flex-col items-center gap-6 px-4 text-center"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <Sparkles className="h-4 w-4" />
          AI-Powered Code Analysis
        </div>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white md:text-7xl">
          Understand your codebase{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            instantly
          </span>
        </h1>

        <p className="max-w-2xl text-lg text-white/60 md:text-xl">
          Get AI-powered summaries of every commit, ask questions about your code,
          and onboard faster with intelligent code analysis.
        </p>

        <div className="mt-4 flex items-center gap-4">
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
        </div>

        {session && (
          <p className="mt-2 text-sm text-white/50">
            Welcome back, {session.user.name}
          </p>
        )}
      </motion.div>
    </main>
  );
}
