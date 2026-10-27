import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { BarsChart, DailyChart, DonutChart } from "@/components/Charts";
import { PageHeader, Panel } from "@/components/ReportBits";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — CivicLens" },
      { name: "description", content: "Category, priority and daily trends across civic issue reports." },
      { property: "og:title", content: "Analytics — CivicLens" },
      { property: "og:description", content: "Civic issue reporting trends on CivicLens." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { analytics: a } = useReports();
  const delta = a.last7 - a.prev7;
  const stats = [
    { label: "Total reports", value: a.total },
    { label: "Open", value: a.pending },
    { label: "Resolved", value: a.resolved },
    { label: "Resolution rate", value: `${a.resolutionRate}%` },
  ];
  return (
    <div className="animate-fade-up">
      <PageHeader title="Analytics" description="All figures are calculated live from the reports stored in this browser (includes demo data)." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Daily reporting activity" subtitle="Last 14 days" className="lg:col-span-2"><DailyChart data={a.daily} height={260} /></Panel>
        <Panel title="Recent trend">
          <div className="flex h-[260px] flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${delta >= 0 ? "bg-warning-soft text-warning" : "bg-success-soft text-success"}`}>
                {delta >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </span>
              <div>
                <p className="font-display text-2xl font-semibold">{a.last7} <span className="text-sm font-normal text-muted-foreground">this week</span></p>
                <p className="text-sm text-muted-foreground">{a.prev7} the week before ({delta >= 0 ? "+" : ""}{delta})</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Open vs resolved</p>
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              <div className="bg-success" style={{ width: `${a.resolutionRate}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{a.resolved} resolved · {a.pending} open</p>
          </div>
        </Panel>
        <Panel title="Category distribution" className="lg:col-span-2"><BarsChart data={a.byCategory} horizontal height={280} /></Panel>
        <Panel title="Priority distribution"><DonutChart data={a.byPriority} height={280} /></Panel>
      </div>
    </div>
  );
}
