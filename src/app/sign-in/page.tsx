"use client";

import { signIn } from "~/lib/auth-client";
import { Github } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const handleGithubSignIn = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Sign in to Morg</h1>
          <p className="mt-2 text-sm text-white/60">
            AI-powered code analysis for your repositories
          </p>
        </div>

        <button
          onClick={handleGithubSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-white/90"
        >
          <Github className="h-5 w-5" />
          Continue with GitHub
        </button>

        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-white/70 underline hover:text-white">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
