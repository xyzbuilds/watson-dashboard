"use client";

import { DataTable } from "@/components/dashboard/data-table";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatusStrip } from "@/components/dashboard/status-strip";
import { useApiData } from "@/components/dashboard/use-api-data";
import { formatCurrency } from "@/lib/utils";

const INITIAL = {
  gateway: { online: false, latencyMs: null, message: "Loading", checkedAt: "" },
  nodes: [],
  events: [],
  cronJobs: [],
};

export default function InfraPage() {
  const { data, loading, error } = useApiData("/api/infra", INITIAL);
  return (
    <PageShell title="Infrastructure" eyebrow="Infra" loading={loading} error={error}>
      <StatusStrip gateway={data.gateway} nodes={data.nodes} todayCost={formatCurrency(0)} />
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTable
          title="Node Health"
          columns={["Node", "Status", "Detail"]}
          rows={data.nodes.map((node: { name: string; status: string; detail: string }) => [node.name, node.status, node.detail])}
        />
        <DataTable
          title="Cron Jobs"
          columns={["Name", "Schedule", "Status", "Detail"]}
          rows={data.cronJobs.map((job: { name: string; schedule: string; status: string; detail: string }) => [
            job.name,
            job.schedule,
            job.status,
            job.detail,
          ])}
        />
      </div>
      <DataTable
        title="Integration Events"
        columns={["Time", "Category", "Detail"]}
        rows={data.events.map((event: { time: string; category: string; summary: string }) => [
          event.time,
          event.category,
          event.summary,
        ])}
      />
    </PageShell>
  );
}
