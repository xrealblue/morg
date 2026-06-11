import Link from "next/link";

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-zinc-900">
            Morg
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-500">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-800"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
