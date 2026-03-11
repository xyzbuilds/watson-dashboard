"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

const COMMANDS = [
  { href: "/", label: "Go to Home", keywords: "overview summary dashboard" },
  { href: "/costs", label: "Open Costs", keywords: "spend tokens budget charts" },
  { href: "/email", label: "Open Email", keywords: "gmail triage inbox" },
  { href: "/agents", label: "Open Agents", keywords: "sessions codex claude" },
  { href: "/infra", label: "Open Infra", keywords: "gateway cron nodes status" },
  { href: "/content", label: "Open Content", keywords: "queue drafts library" },
  { href: "/projects", label: "Open Projects", keywords: "git repos milestones" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands = useMemo(() => {
    const normalized = query.toLowerCase();
    return COMMANDS.filter((command) =>
      `${command.label} ${command.keywords}`.toLowerCase().includes(normalized)
    );
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-20 max-w-2xl">
        <Card className="overflow-hidden border-cyan-500/20">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jump to page or panel"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <div className="p-2">
            {commands.map((command) => (
              <Link
                key={command.href}
                href={command.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm text-slate-200 transition hover:bg-white/5"
              >
                {command.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
