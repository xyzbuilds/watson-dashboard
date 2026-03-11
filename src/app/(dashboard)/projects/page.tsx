"use client";

import { DataTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageShell } from "@/components/dashboard/page-shell";
import { useApiData } from "@/components/dashboard/use-api-data";

const INITIAL = { projects: [] };

export default function ProjectsPage() {
  const { data, loading, error } = useApiData("/api/projects", INITIAL);
  const projects = data.projects ?? [];

  return (
    <PageShell title="Projects Tracker" eyebrow="Projects" loading={loading} error={error}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active Repos" value={String(projects.length)} detail="Git repositories detected under ~/Projects" />
        <MetricCard label="Dirty Trees" value={String(projects.filter((item: { dirty: boolean }) => item.dirty).length)} detail="Repos with uncommitted changes" />
        <MetricCard label="Clean Trees" value={String(projects.filter((item: { dirty: boolean }) => !item.dirty).length)} detail="Repos ready for next task" />
      </div>
      <DataTable
        title="Project Activity"
        columns={["Project", "Branch", "Dirty", "Last Commit", "Summary"]}
        rows={projects.map((project: { name: string; branch: string; dirty: boolean; lastCommit: string; summary: string }) => [
          project.name,
          project.branch,
          project.dirty ? "yes" : "no",
          project.lastCommit,
          project.summary,
        ])}
      />
    </PageShell>
  );
}
