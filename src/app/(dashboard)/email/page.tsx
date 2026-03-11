"use client";

import { EmailPieChart } from "@/components/dashboard/charts";
import { DataTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageShell } from "@/components/dashboard/page-shell";
import { useApiData } from "@/components/dashboard/use-api-data";

const INITIAL = { emails: [] };

export default function EmailPage() {
  const { data, loading, error } = useApiData("/api/emails", INITIAL);
  const emails = data.emails ?? [];
  const urgent = emails.filter((item: { category: string }) => item.category.includes("URGENT")).length;
  const useful = emails.filter((item: { category: string }) => item.category.includes("USEFUL") || item.category.includes("ACTION")).length;
  const noise = emails.filter((item: { category: string }) => item.category.includes("NOISE")).length;

  return (
    <PageShell title="Email Dashboard" eyebrow="Email" loading={loading} error={error}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Urgent" value={String(urgent)} detail="Needs immediate attention" />
        <MetricCard label="Useful" value={String(useful)} detail="Likely follow-up items" />
        <MetricCard label="Noise" value={String(noise)} detail="Candidates for unsubscribe or promotions" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <EmailPieChart
          title="Category Distribution"
          data={[
            { label: "Urgent", value: urgent },
            { label: "Useful", value: useful },
            { label: "Noise", value: noise },
          ]}
        />
        <DataTable
          title="Recent Triage"
          columns={["Date", "Time", "Category", "Subject", "Action"]}
          rows={emails.map((email: { date: string; time: string; category: string; subject: string; action: string }) => [
            email.date,
            email.time,
            email.category,
            email.subject,
            email.action,
          ])}
        />
      </div>
    </PageShell>
  );
}
