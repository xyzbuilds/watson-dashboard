"use client";

import { CostBreakdownChart, TrendChart } from "@/components/dashboard/charts";
import { DataTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageShell } from "@/components/dashboard/page-shell";
import { useApiData } from "@/components/dashboard/use-api-data";
import { formatCompact, formatCurrency } from "@/lib/utils";

const INITIAL = { todayTotal: 0, byModel: [], trend: [], topSessions: [], monthlyBudget: 250 };

export default function CostsPage() {
  const { data, loading, error } = useApiData("/api/costs", INITIAL);
  const totalTokens = data.byModel.reduce((sum: number, item: { tokens: number }) => sum + item.tokens, 0);

  return (
    <PageShell title="Cost Center" eyebrow="Costs" loading={loading} error={error}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Today" value={formatCurrency(data.todayTotal)} detail="Estimated from visible session and log-derived activity" />
        <MetricCard label="Budget" value={formatCurrency(data.monthlyBudget)} detail={`${Math.round((data.todayTotal / data.monthlyBudget) * 100 || 0)}% of monthly target`} />
        <MetricCard label="Tokens" value={formatCompact(totalTokens)} detail="Persisted snapshots stored in SQLite" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <TrendChart data={data.trend} title="Spend Trend" />
        <CostBreakdownChart data={data.byModel} title="Spend by Model" />
      </div>
      <DataTable
        title="Top Sessions"
        columns={["Label", "Kind", "Model", "Tokens", "Cost"]}
        rows={data.topSessions.map((session: { label: string; kind: string; model: string; totalTokens: number; estimatedCost: number }) => [
          session.label,
          session.kind,
          session.model,
          formatCompact(session.totalTokens),
          formatCurrency(session.estimatedCost),
        ])}
      />
    </PageShell>
  );
}
