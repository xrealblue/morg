"use client";

import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  Bot,
  Presentation,
  CreditCard,
  Plus,
  ChevronLeft,
  GitPullRequest,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MorgLogo } from "~/components/MorgLogo";
import useProject from "~/hooks/use-project";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Q&A", href: "/qa", icon: Bot },
  { label: "Pull Requests", href: "/dashboard/prs", icon: GitPullRequest },
  { label: "Meetings", href: "/meetings", icon: Presentation },
  { label: "Billing", href: "/billing", icon: CreditCard },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { projects, projectId, setProjectId } = useProject();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-zinc-200 bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col p-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/">
              <h1 className="flex items-center gap-2 text-xl font-bold text-zinc-900" style={{ fontFamily: "var(--font-berkeley-mono)" }}>
                <MorgLogo className="size-5" />
                Morg
              </h1>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isCollapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900",
                pathname === item.href && "bg-zinc-100 font-medium text-zinc-900",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Projects */}
        <div className="mt-8">
          {!isCollapsed && (
            <h2 className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              Projects
            </h2>
          )}
          <div className="space-y-1">
            {projects?.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setProjectId(project.id);
                  router.push("/dashboard");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100",
                  project.id === projectId && "bg-zinc-100 font-medium text-zinc-900",
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-xs font-medium",
                    project.id === projectId && "border-zinc-400 bg-zinc-200",
                  )}
                >
                  {project.name[0]?.toUpperCase()}
                </div>
                {!isCollapsed && (
                  <span className="truncate">{project.name}</span>
                )}
              </button>
            ))}

            <Link
              href="/create"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Plus className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>New Project</span>}
            </Link>
          </div>
        </div>


      </div>
    </aside>
  );
}
