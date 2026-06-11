import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-zinc-200">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-zinc-900">
        Repository not found
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        The repository you are looking for does not exist or is private.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-zinc-200 px-6 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
      >
        Go home
      </Link>
    </div>
  );
}
