import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function toneClass(tone: string) {
  switch (tone) {
    case "healthy":
      return "bg-emerald-400";
    case "warn":
      return "bg-amber-400";
    case "error":
      return "bg-rose-400";
    default:
      return "bg-slate-500";
  }
}
