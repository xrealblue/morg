"use client";

import AppSidebar from "./app-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AppSidebar />

      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
