"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatusStrip } from "@/components/dashboard/status-strip";
import { DataTable } from "@/components/dashboard/data-table";
import { EmailPieChart, TrendChart } from "@/components/dashboard/charts";
import { useApiData } from "@/components/dashboard/use-api-data";
import { formatCompact, formatCurrency } from "@/lib/utils";

const INITIAL_DATA = {
  generatedAt: "",
  gateway: { online: false, latencyMs: null, message: "Loading", checkedAt: "" },
  nodes: [],
  summary: { emailCount: 0, urgentCount: 0, actionCount: 0, activeSessions: 0, todayCost: 0 },
  emailBreakdown: {},
  events: [],
  emails: [],
  sessions: [],
  costs: { todayTotal: 0, byModel: [], trend: [], topSessions: [], monthlyBudget: 250 },
  content: [],
  projects: [],
};

export function HomePage() {
  const { data, loading, error } = useApiData("/api/dashboard", INITIAL_DATA);

  return (
    <PageShell title="Morning Glance" eyebrow="Home" loading={loading} error={error}>
      <StatusStrip gateway={data.gateway} nodes={data.nodes} todayCost={formatCurrency(data.summary.todayCost)} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Emails Today" value={String(data.summary.emailCount)} detail="Triaged from daily markdown logs" />
        <MetricCard label="Urgent" value={String(data.summary.urgentCount)} detail="High-priority messages surfaced by Watson" />
        <MetricCard label="Actions" value={String(data.summary.actionCount)} detail="Useful emails likely needing follow-up" />
        <MetricCard label="Tokens" value={formatCompact(data.costs.byModel.reduce((sum: number, item: { tokens: number }) => sum + item.tokens, 0))} detail="Estimated token volume across visible sessions" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <TrendChart data={data.costs.trend} title="30 Day Cost Trend" />
        <EmailPieChart
          title="Today Email Mix"
          data={Object.entries(data.emailBreakdown).map(([label, value]) => ({ label, value: Number(value) }))}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <DataTable
          title="Important Events"
          columns={["Time", "Category", "Detail"]}
          rows={data.events.map((event: { time: string; category: string; summary: string }) => [
            event.time,
            event.category,
            event.summary,
          ])}
        />
        <DataTable
          title="Active Sessions"
          columns={["Agent", "Kind", "Model", "Cost"]}
          rows={data.sessions.slice(0, 8).map((session: { agent: string; kind: string; model: string; estimatedCost: number }) => [
            session.agent,
            session.kind,
            session.model,
            formatCurrency(session.estimatedCost),
          ])}
        />
      </div>
    </PageShell>
  );
}
