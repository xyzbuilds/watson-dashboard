export type StatusTone = "healthy" | "warn" | "error" | "neutral";

export interface GatewayStatus {
  online: boolean;
  latencyMs: number | null;
  message: string;
  checkedAt: string;
}

export interface NodeStatus {
  name: string;
  status: StatusTone;
  detail: string;
  lastSeen?: string;
}

export interface EventItem {
  id: string;
  time: string;
  category: string;
  summary: string;
  detail?: string;
  tone: StatusTone;
}

export interface EmailItem {
  id: string;
  date: string;
  time: string;
  category: string;
  subject: string;
  action: string;
  tone: StatusTone;
  sender?: string | null;
}

export interface SessionItem {
  id: string;
  label: string;
  agent: string;
  kind: string;
  model: string;
  status: "running" | "completed" | "failed" | "offline";
  lastActivity: string;
  durationMinutes: number;
  estimatedCost: number;
  totalTokens: number;
  summary: string;
}

export interface CostBucket {
  label: string;
  cost: number;
  tokens: number;
}

export interface CronJobItem {
  id: string;
  name: string;
  schedule: string;
  status: string;
  lastRun?: string | null;
  nextRun?: string | null;
  detail: string;
}

export interface ContentItem {
  id: string;
  title: string;
  queue: string;
  path: string;
  modifiedAt: string;
  excerpt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  path: string;
  branch: string;
  dirty: boolean;
  lastCommit: string;
  summary: string;
}
