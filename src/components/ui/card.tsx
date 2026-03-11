import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_0_0_1px_rgba(148,163,184,0.03)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
