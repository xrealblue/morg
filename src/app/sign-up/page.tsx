"use client";

import { signIn } from "~/lib/auth-client";
import { Github } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const handleGithubSignUp = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create an account</h1>
          <p className="mt-2 text-sm text-white/60">
            Start analyzing your repositories with AI
          </p>
        </div>

        <button
          onClick={handleGithubSignUp}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-white/90"
        >
          <Github className="h-5 w-5" />
          Sign up with GitHub
        </button>

        <p className="text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-white/70 underline hover:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
