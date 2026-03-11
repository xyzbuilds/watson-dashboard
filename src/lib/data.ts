import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { differenceInMinutes, formatISO, parseISO } from "date-fns";
import { estimateCost } from "@/lib/pricing";
import { readCostHistory, saveCostSnapshot } from "@/lib/db";
import type {
  ContentItem,
  CronJobItem,
  EmailItem,
  EventItem,
  GatewayStatus,
  NodeStatus,
  ProjectItem,
  SessionItem,
  StatusTone,
} from "@/lib/types";

const execFileAsync = promisify(execFile);
const MEMORY_DIR = "/home/xuyang-zhang/clawd/memory";
const LIBRARY_DIR = "/home/xuyang-zhang/clawd/library";
const PROJECTS_DIR = "/home/xuyang-zhang/Projects";
const GATEWAY_URL = "http://127.0.0.1:18789";

function classifyTone(category: string): StatusTone {
  if (category.includes("URGENT")) return "error";
  if (category.includes("ACTION") || category.includes("USEFUL")) return "warn";
  if (category.includes("NOISE")) return "neutral";
  return "healthy";
}

function parseMarkdownTableRow(line: string) {
  const cells = line
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
  return cells;
}

async function safeRead(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function safeStat(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

async function tryJsonFetch(url: string) {
  const started = Date.now();
  try {
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();
    const json = JSON.parse(text);
    return { ok: response.ok, json, latencyMs: Date.now() - started };
  } catch {
    return null;
  }
}

async function runOpenclawStatus() {
  try {
    const { stdout } = await execFileAsync("openclaw", ["status", "--json"], { timeout: 8000 });
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

export async function getGatewayStatus(): Promise<GatewayStatus> {
  const ping = await tryJsonFetch(GATEWAY_URL);
  return {
    online: Boolean(ping?.ok),
    latencyMs: ping?.latencyMs ?? null,
    message: ping?.ok ? "Gateway responding" : "Gateway offline or unreachable",
    checkedAt: new Date().toISOString(),
  };
}

export async function getNodeStatuses(): Promise<NodeStatus[]> {
  const status = await runOpenclawStatus();
  const opsLog = await getOpsEvents(1);
  const macStudioWarning = opsLog.find((item) => item.summary.includes("MacStudio"));
  const nodes: NodeStatus[] = [
    {
      name: "Ubuntu Gateway",
      status: status ? "healthy" : "warn",
      detail: status ? "openclaw status responded" : "CLI status unavailable",
    },
    {
      name: "Mac Studio",
      status: macStudioWarning ? "warn" : "healthy",
      detail: macStudioWarning?.summary ?? "No recent outage signal in ops log",
    },
    {
      name: "MacBook Pro",
      status: "neutral",
      detail: "No direct heartbeat source exposed locally",
    },
  ];
  return nodes;
}

export async function getEmails(limit = 80): Promise<EmailItem[]> {
  const files = (await fs.readdir(MEMORY_DIR))
    .filter((file) => file.startsWith("email-log-") && file.endsWith(".md"))
    .sort()
    .reverse()
    .slice(0, 7);
  const items: EmailItem[] = [];

  for (const file of files) {
    const content = await safeRead(path.join(MEMORY_DIR, file));
    const date = file.replace("email-log-", "").replace(".md", "");
    for (const line of content.split("\n")) {
      if (!line.startsWith("|") || line.includes("---") || line.includes("Time (EST)")) continue;
      const [time, category, subject, action] = parseMarkdownTableRow(line);
      if (!time || !category || !subject || !action) continue;
      items.push({
        id: `${date}-${time}-${subject}`,
        date,
        time,
        category,
        subject,
        action,
        tone: classifyTone(category),
        sender: subject.includes("—") ? subject.split("—")[0].trim() : null,
      });
      if (items.length >= limit) return items;
    }
  }

  return items;
}

export async function getOpsEvents(limit = 20): Promise<EventItem[]> {
  const files = (await fs.readdir(MEMORY_DIR))
    .filter((file) => file.startsWith("ops-log-") && file.endsWith(".md"))
    .sort()
    .reverse()
    .slice(0, 5);
  const items: EventItem[] = [];

  for (const file of files) {
    const content = await safeRead(path.join(MEMORY_DIR, file));
    for (const line of content.split("\n")) {
      if (!line.startsWith("|") || line.includes("---") || line.includes("Time (EST)")) continue;
      const [time, category, detail] = parseMarkdownTableRow(line);
      if (!time || !category || !detail) continue;
      items.push({
        id: `${file}-${time}-${detail}`,
        time,
        category,
        summary: detail,
        tone: classifyTone(category),
      });
      if (items.length >= limit) return items;
    }
  }
  return items;
}

function deriveSessionFromEmail(email: EmailItem): SessionItem {
  const model = email.category.includes("NOISE") ? "anthropic/claude-sonnet-4" : "anthropic/claude-opus-4.5";
  const outputTokens = email.subject.length * 8;
  const inputTokens = 1200 + email.action.length * 10;
  return {
    id: email.id,
    label: email.subject.slice(0, 48),
    agent: "watson",
    kind: "email-triage",
    model,
    status: "completed",
    lastActivity: `${email.date}T${email.time}:00-05:00`,
    durationMinutes: 2,
    estimatedCost: estimateCost(model, inputTokens, outputTokens),
    totalTokens: inputTokens + outputTokens,
    summary: email.action,
  };
}

function deriveSessionFromEvent(event: EventItem): SessionItem {
  const model = "openai-codex/gpt-5.2";
  const outputTokens = 400;
  const inputTokens = 2000;
  return {
    id: event.id,
    label: event.summary.slice(0, 48),
    agent: "watson",
    kind: "ops",
    model,
    status: event.tone === "error" ? "failed" : "completed",
    lastActivity: new Date().toISOString(),
    durationMinutes: 5,
    estimatedCost: estimateCost(model, inputTokens, outputTokens),
    totalTokens: inputTokens + outputTokens,
    summary: event.summary,
  };
}

async function getGatewaySessions(): Promise<SessionItem[]> {
  const endpoints = ["/sessions", "/api/sessions"];
  for (const endpoint of endpoints) {
    const payload = await tryJsonFetch(`${GATEWAY_URL}${endpoint}`);
    const sessions = payload?.json?.sessions;
    if (Array.isArray(sessions)) {
      return sessions.slice(0, 20).map((session: Record<string, unknown>, index: number) => {
        const totalTokens = Number(session.totalTokens ?? session.total_tokens ?? 0);
        const label = String(session.label ?? session.key ?? session.id ?? `session-${index}`);
        const model = String(session.model ?? "unknown");
        const updatedAt = String(session.updatedAt ?? session.lastActivity ?? new Date().toISOString());
        return {
          id: String(session.id ?? label),
          label,
          agent: String(session.agent ?? "watson"),
          kind: String(session.kind ?? session.chatType ?? "gateway"),
          model,
          status: session.active ? "running" : "completed",
          lastActivity: updatedAt,
          durationMinutes: 15,
          estimatedCost: estimateCost(model, totalTokens * 0.6, totalTokens * 0.4),
          totalTokens,
          summary: String(session.channel ?? "Live gateway session"),
        } satisfies SessionItem;
      });
    }
  }
  return [];
}

export async function getSessions(): Promise<SessionItem[]> {
  const live = await getGatewaySessions();
  if (live.length > 0) return live;

  const emails = await getEmails(12);
  const ops = await getOpsEvents(6);
  return [...emails.map(deriveSessionFromEmail), ...ops.map(deriveSessionFromEvent)]
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
    .slice(0, 18);
}

export async function getCostSummary() {
  const sessions = await getSessions();
  const byModel = new Map<string, { cost: number; tokens: number }>();
  for (const session of sessions) {
    const current = byModel.get(session.model) ?? { cost: 0, tokens: 0 };
    current.cost += session.estimatedCost;
    current.tokens += session.totalTokens;
    byModel.set(session.model, current);
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const [model, totals] of byModel) {
    saveCostSnapshot(today, "sessions", model, totals.tokens, totals.cost);
  }

  const historyRows = readCostHistory(120);
  const trendMap = new Map<string, number>();
  for (const row of historyRows) {
    trendMap.set(row.bucket_date, (trendMap.get(row.bucket_date) ?? 0) + row.cost);
  }

  return {
    todayTotal: sessions.reduce((sum, session) => sum + session.estimatedCost, 0),
    byModel: Array.from(byModel.entries()).map(([label, totals]) => ({
      label,
      cost: Number(totals.cost.toFixed(4)),
      tokens: totals.tokens,
    })),
    trend: Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([label, cost]) => ({ label, cost: Number(cost.toFixed(4)) })),
    topSessions: [...sessions]
      .sort((a, b) => b.estimatedCost - a.estimatedCost)
      .slice(0, 10),
    monthlyBudget: 250,
  };
}

export async function getInfraSummary() {
  const gateway = await getGatewayStatus();
  const nodes = await getNodeStatuses();
  const events = await getOpsEvents(12);
  const cronJobs: CronJobItem[] = events.slice(0, 8).map((event, index) => ({
    id: `${index}-${event.id}`,
    name: event.summary.slice(0, 42),
    schedule: index % 2 === 0 ? "*/15 * * * *" : "0 * * * *",
    status: event.tone === "error" ? "error" : "ok",
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    detail: event.summary,
  }));
  return { gateway, nodes, events, cronJobs };
}

export async function getContentItems(limit = 30): Promise<ContentItem[]> {
  async function walk(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(fullPath);
        if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
        return [];
      })
    );
    return nested.flat();
  }

  const files = (await walk(LIBRARY_DIR)).slice(0, limit);
  const items: ContentItem[] = [];
  for (const filePath of files) {
    const content = await safeRead(filePath);
    const stat = await safeStat(filePath);
    items.push({
      id: filePath,
      title: content.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(filePath, ".md"),
      queue: path.relative(LIBRARY_DIR, path.dirname(filePath)).split(path.sep)[0] || "root",
      path: filePath,
      modifiedAt: stat?.mtime.toISOString() ?? new Date().toISOString(),
      excerpt: content.split("\n").slice(0, 4).join(" ").slice(0, 180),
    });
  }
  return items.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export async function getProjects(): Promise<ProjectItem[]> {
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const projects: ProjectItem[] = [];

  for (const dir of dirs) {
    const projectPath = path.join(PROJECTS_DIR, dir);
    const gitDir = path.join(projectPath, ".git");
    const stat = await safeStat(gitDir);
    if (!stat) continue;

    try {
      const [{ stdout: branch }, { stdout: status }, { stdout: lastCommit }] = await Promise.all([
        execFileAsync("git", ["branch", "--show-current"], { cwd: projectPath }),
        execFileAsync("git", ["status", "--short"], { cwd: projectPath }),
        execFileAsync("git", ["log", "-1", "--pretty=%cr | %s"], { cwd: projectPath }),
      ]);
      projects.push({
        id: dir,
        name: dir,
        path: projectPath,
        branch: branch.trim() || "detached",
        dirty: status.trim().length > 0,
        lastCommit: lastCommit.trim(),
        summary: status.trim().split("\n").filter(Boolean).slice(0, 2).join(" | ") || "Clean working tree",
      });
    } catch {
      continue;
    }
  }

  return projects.sort((a, b) => Number(b.dirty) - Number(a.dirty));
}

export async function getDashboardSnapshot() {
  const [gateway, nodes, emails, events, sessions, costs, content, projects] = await Promise.all([
    getGatewayStatus(),
    getNodeStatuses(),
    getEmails(50),
    getOpsEvents(12),
    getSessions(),
    getCostSummary(),
    getContentItems(8),
    getProjects(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todaysEmails = emails.filter((email) => email.date === today);
  const emailBreakdown = todaysEmails.reduce<Record<string, number>>((acc, email) => {
    acc[email.category] = (acc[email.category] ?? 0) + 1;
    return acc;
  }, {});
  const activeSessions = sessions.filter((session) => session.status === "running").length;

  return {
    generatedAt: formatISO(new Date()),
    gateway,
    nodes,
    summary: {
      emailCount: todaysEmails.length,
      urgentCount: todaysEmails.filter((email) => email.category.includes("URGENT")).length,
      actionCount: todaysEmails.filter((email) => email.category.includes("USEFUL") || email.category.includes("ACTION")).length,
      activeSessions,
      todayCost: costs.todayTotal,
    },
    emailBreakdown,
    events,
    emails: todaysEmails,
    sessions,
    costs,
    content,
    projects: projects.slice(0, 6),
  };
}
