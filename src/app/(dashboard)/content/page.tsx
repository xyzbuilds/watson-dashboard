"use client";

import { DataTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageShell } from "@/components/dashboard/page-shell";
import { useApiData } from "@/components/dashboard/use-api-data";

const INITIAL = { items: [] };

export default function ContentPage() {
  const { data, loading, error } = useApiData("/api/content", INITIAL);
  const items = data.items ?? [];
  const queues = new Set(items.map((item: { queue: string }) => item.queue)).size;

  return (
    <PageShell title="Content Pipeline" eyebrow="Content" loading={loading} error={error}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Queued Files" value={String(items.length)} detail="Markdown items from clawd/library" />
        <MetricCard label="Queues" value={String(queues)} detail="Top-level pipeline buckets" />
        <MetricCard label="Drafts" value={String(items.filter((item: { queue: string }) => item.queue === "drafts").length)} detail="Pending review items" />
      </div>
      <DataTable
        title="Content Queue"
        columns={["Title", "Queue", "Updated", "Excerpt"]}
        rows={items.map((item: { title: string; queue: string; modifiedAt: string; excerpt: string }) => [
          item.title,
          item.queue,
          item.modifiedAt.slice(0, 16).replace("T", " "),
          item.excerpt,
        ])}
      />
    </PageShell>
  );
}
