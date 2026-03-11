"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Activity, BriefcaseBusiness, FolderKanban, Mail, Server, Wallet } from "lucide-react";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/costs", label: "Costs", icon: Wallet },
  { href: "/email", label: "Email", icon: Mail },
  { href: "/agents", label: "Agents", icon: BriefcaseBusiness },
  { href: "/infra", label: "Infra", icon: Server },
  { href: "/content", label: "Content", icon: FolderKanban },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0f2741,transparent_40%),linear-gradient(180deg,#020617,#020617_35%,#020617)] text-slate-100">
      <CommandPalette />
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[240px_1fr] lg:px-6">
        <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
          <div className="mb-8 border-b border-white/10 pb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Watson</p>
            <h1 className="mt-2 text-xl font-semibold text-white">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Everything Watson does, at a glance.</p>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white",
                    active && "bg-cyan-500/10 text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
            Cmd/Ctrl + K for command palette
          </div>
        </aside>
        <main className="min-w-0 py-1">{children}</main>
      </div>
    </div>
  );
}
