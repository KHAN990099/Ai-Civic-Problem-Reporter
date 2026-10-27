import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FilePlus2, Files, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/useReports";
import { BarsChart, DailyChart, DonutChart } from "@/components/Charts";
import { DemoTag, PageHeader, Panel, PriorityBadge, ReportImage, StatusBadge, fmtDate } from "@/components/ReportBits";
import { CATEGORY_LABELS } from "@/types/report";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — CivicLens" },
      { name: "description", content: "City civic issues at a glance: reports, priorities and resolution status." },
      { property: "og:title", content: "Overview — CivicLens" },
      { property: "og:description", content: "City civic issues at a glance on CivicLens." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { reports, analytics: a } = useReports();
  const navigate = useNavigate();
  const demo = reports.filter((r) => r.isDemo).length;
  const mine = reports.length - demo;

  const metrics = [
    { label: "Total Reports", value: a.total, icon: Files, tone: "text-primary bg-accent", search: {} },
    { label: "Pending Reports", value: a.pending, icon: Clock, tone: "text-warning bg-warning-soft", search: { status: "open" } },
    { label: "Resolved Reports", value: a.resolved, icon: CheckCircle2, tone: "text-success bg-success-soft", search: { status: "Resolved" } },
    { label: "High-Priority Open", value: a.highOpen, icon: AlertTriangle, tone: "text-destructive bg-danger-soft", search: { status: "open", priority: "High" } },
  ] as const;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="City issues at a glance"
        description="Track civic problems reported across neighbourhoods — from potholes to blocked drains — and follow them to resolution."
        actions={
          <Button variant="hero" size="lg" asChild>
            <Link to="/report"><FilePlus2 /> Report New Issue</Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-gradient-banner p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 opacity-80" />
          <div>
            <p className="font-semibold">Running in demo mode</p>
            <p className="text-sm opacity-80">
              {demo} sample reports (DEMO DATA) · {mine} citizen-created demo report{mine === 1 ? "" : "s"} · AI results are simulated, not Gemma 4.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/settings">Manage demo data</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {metrics.map((m) => (
          <button
            key={m.label}
            onClick={() => navigate({ to: "/issues", search: m.search })}
            className="card-surface group p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${m.tone}`}><m.icon className="h-4 w-4" /></span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-4 font-display text-3xl font-semibold">{m.value}</p>
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">{m.label}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Reports over the last 14 days" subtitle={`${a.last7} this week`} className="lg:col-span-2">
          <DailyChart data={a.daily} />
        </Panel>
        <Panel title="Reports by status">
          <DonutChart data={a.byStatus} />
        </Panel>
        <Panel title="Reports by category" className="lg:col-span-3">
          <BarsChart data={a.byCategory.map((c) => ({ name: c.name.split(" /")[0] ?? c.name, count: c.count }))} height={220} />
        </Panel>
      </div>

      <Panel title="Recent reports" className="mt-6 overflow-hidden p-0 sm:p-0" action={<Button variant="link" size="sm" asChild><Link to="/issues">View all</Link></Button>}>
        <div className="-mt-1 overflow-x-auto px-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Report</th>
                <th className="px-3 py-3 font-semibold">Category</th>
                <th className="px-3 py-3 font-semibold">Location</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {reports.slice().sort((x, y) => y.createdAt.localeCompare(x.createdAt)).slice(0, 6).map((r) => (
                <tr key={r.id} onClick={() => navigate({ to: "/issues/$id", params: { id: r.id } })} className="cursor-pointer border-b last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <ReportImage src={r.imageUrl} alt={CATEGORY_LABELS[r.category]} className="h-10 w-14 shrink-0 rounded-md" />
                      <div>
                        <p className="font-mono text-xs font-semibold">{r.id}</p>
                        {r.isDemo && <DemoTag>Demo data</DemoTag>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">{CATEGORY_LABELS[r.category]}</td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-muted-foreground">{r.location}</td>
                  <td className="px-3 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{fmtDate(r.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                      <Link to="/issues/$id" params={{ id: r.id }}>View Details</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
