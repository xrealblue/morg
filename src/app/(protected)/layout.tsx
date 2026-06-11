"use client";

import AppSidebar from "./app-sidebar";
import { useSession } from "~/lib/auth-client";
import Image from "next/image";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AppSidebar />

      <main className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-end border-b border-zinc-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            {session?.user.name && (
              <span className="text-sm text-zinc-600">{session.user.name}</span>
            )}
            {session?.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
