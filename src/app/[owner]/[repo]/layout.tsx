"use client";

import Link from "next/link";
import { MorgLogo } from "~/components/MorgLogo";

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--diffshub-sidebar-bg)]">
        <div className="flex h-12 items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)] transition-opacity hover:opacity-80"
            style={{ fontFamily: "var(--font-berkeley-mono)" }}
          >
            <MorgLogo className="size-4" />
            Morg
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
