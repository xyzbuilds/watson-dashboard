"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function PageShell({
  title,
  eyebrow,
  loading,
  error,
  children,
}: {
  title: string;
  eyebrow: string;
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Refreshing
          </div>
        ) : null}
      </div>
      {error ? (
        <Card className="flex items-center gap-3 border-rose-500/20 p-4 text-sm text-rose-200">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </Card>
      ) : null}
      {children}
    </section>
  );
}
