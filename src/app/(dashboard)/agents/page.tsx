"use client";

import { DataTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageShell } from "@/components/dashboard/page-shell";
import { useApiData } from "@/components/dashboard/use-api-data";
import { formatCompact, formatCurrency } from "@/lib/utils";

const INITIAL = { sessions: [] };

export default function AgentsPage() {
  const { data, loading, error } = useApiData("/api/sessions", INITIAL);
  const sessions = data.sessions ?? [];

  return (
    <PageShell title="Agent Activity" eyebrow="Agents" loading={loading} error={error}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Running" value={String(sessions.filter((item: { status: string }) => item.status === "running").length)} detail="Live sessions from gateway when available" />
        <MetricCard label="Completed" value={String(sessions.filter((item: { status: string }) => item.status === "completed").length)} detail="Finished tasks synthesized from recent activity" />
        <MetricCard label="Estimated Spend" value={formatCurrency(sessions.reduce((sum: number, item: { estimatedCost: number }) => sum + item.estimatedCost, 0))} detail="Across visible agent work" />
      </div>
      <DataTable
        title="Sessions"
        columns={["Agent", "Kind", "Model", "Status", "Tokens", "Cost", "Summary"]}
        rows={sessions.map((session: { agent: string; kind: string; model: string; status: string; totalTokens: number; estimatedCost: number; summary: string }) => [
          session.agent,
          session.kind,
          session.model,
          session.status,
          formatCompact(session.totalTokens),
          formatCurrency(session.estimatedCost),
          session.summary,
        ])}
      />
    </PageShell>
  );
}
