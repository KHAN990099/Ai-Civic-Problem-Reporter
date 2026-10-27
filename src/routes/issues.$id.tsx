import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Check, CheckCircle2, ClipboardList, FileQuestion, LayoutDashboard, MapPin, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/useReports";
import { DemoTag, Panel, PriorityBadge, ReportImage, StatusBadge, fmtDate, fmtDateTime } from "@/components/ReportBits";
import { CATEGORY_LABELS, STATUSES, type ReportStatus } from "@/types/report";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/issues/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Report ${params.id} — CivicLens` },
      { name: "description", content: `Details, analysis and status history for civic report ${params.id}.` },
      { property: "og:title", content: `Report ${params.id} — CivicLens` },
      { property: "og:description", content: "Civic issue report details on CivicLens." },
    ],
  }),
  component: Details,
});

function Details() {
  const { id } = Route.useParams();
  const { getReportById, updateReportStatus, ready } = useReports();
  const r = getReportById(id);

  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

  if (!r)
    return (
      <div className="card-surface mx-auto mt-10 flex max-w-lg flex-col items-center px-6 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><FileQuestion className="h-6 w-6" /></span>
        <h1 className="mt-4 text-xl font-semibold">Report not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">No report with ID <span className="font-mono">{id}</span> exists in this browser. It may have been removed by a demo reset.</p>
        <div className="mt-6 flex gap-2">
          <Button asChild><Link to="/issues">Browse issues</Link></Button>
          <Button variant="outline" asChild><Link to="/">Dashboard</Link></Button>
        </div>
      </div>
    );

  const idx = STATUSES.indexOf(r.status);
  const change = async (s: ReportStatus) => {
    try {
      await updateReportStatus(r.id, s);
      toast.success(`Status updated to ${s}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild><Link to="/issues"><ArrowLeft /> Back to Issues</Link></Button>
        <Button variant="ghost" size="sm" asChild><Link to="/"><LayoutDashboard /> Dashboard</Link></Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-muted-foreground">{r.id}</span>
            {r.isDemo && <DemoTag>Demo data</DemoTag>}
          </div>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{CATEGORY_LABELS[r.category]}</h1>
        </div>
        <div className="flex items-center gap-2"><PriorityBadge priority={r.priority} /><StatusBadge status={r.status} /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="card-surface overflow-hidden">
            <ReportImage src={r.imageUrl} alt={`Photo of ${CATEGORY_LABELS[r.category]}`} className="aspect-[16/10] w-full" />
            <div className="p-5">
              <p className="leading-relaxed">{r.description}</p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Location</dt><dd>{r.location}{r.latitude != null && r.longitude != null && <span className="block text-xs text-muted-foreground">{r.latitude}, {r.longitude}</span>}</dd></div></div>
                <div className="flex gap-2"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><div><dt className="text-xs text-muted-foreground">Submitted</dt><dd>{fmtDate(r.createdAt)}</dd></div></div>
              </dl>
            </div>
          </div>

          {r.analysis && (
            <Panel title="Issue analysis" action={<DemoTag mode={r.analysis.mode} />}>
              <p className="text-sm text-muted-foreground">{r.analysis.summary}</p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Search className="h-4 w-4 text-primary" /> Evidence</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">{r.analysis.evidence.map((e, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current" />{e}</li>)}</ul>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4 text-primary" /> Recommended actions</h3>
                  <ol className="space-y-1.5 text-sm text-muted-foreground">{r.analysis.nextSteps.map((s, i) => <li key={i} className="flex gap-2"><span className="font-semibold text-foreground">{i + 1}.</span>{s}</li>)}</ol>
                </div>
              </div>
              <p className="mt-4 flex gap-2 rounded-lg bg-muted p-3 text-sm"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" />{r.analysis.humanReview}</p>
            </Panel>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Panel title="Update status" subtitle="Submitted → Under Review → Resolved">
            <div className="flex flex-col gap-2">
              {STATUSES.map((s, i) => (
                <Button key={s} variant={r.status === s ? "default" : "outline"} disabled={r.status === s} onClick={() => change(s)} className="justify-between">
                  {s}
                  {i < idx ? <Check /> : r.status === s ? <CheckCircle2 /> : null}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Status changes are a demo of the workflow and are saved in this browser only.</p>
          </Panel>

          <Panel title="Status history">
            <ol className="relative ml-2 border-l pl-6">
              {r.statusHistory.slice().reverse().map((h, i) => (
                <li key={i} className="relative pb-5 last:pb-0">
                  <span className={cn("absolute -left-[31px] top-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-card", i === 0 ? "bg-primary" : "bg-border")} />
                  <p className="text-sm font-semibold">{h.status}</p>
                  {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">{fmtDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
