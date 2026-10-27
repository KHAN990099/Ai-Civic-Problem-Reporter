import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FilePlus2, LayoutGrid, List, MapPin, SearchX, Search, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReports } from "@/hooks/useReports";
import { DemoTag, PageHeader, PriorityBadge, ReportImage, StatusBadge, fmtDate } from "@/components/ReportBits";
import { CATEGORIES, CATEGORY_LABELS, PRIORITIES, STATUSES } from "@/types/report";
import { cn } from "@/lib/utils";

type Search = { q?: string | undefined; category?: string | undefined; status?: string | undefined; priority?: string | undefined; sort?: "new" | "old" | undefined; view?: "grid" | "table" | undefined };

export const Route = createFileRoute("/issues/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    category: typeof s["category"] === "string" ? s["category"] : undefined,
    status: typeof s["status"] === "string" ? s["status"] : undefined,
    priority: typeof s["priority"] === "string" ? s["priority"] : undefined,
    sort: s["sort"] === "old" ? "old" : undefined,
    view: s["view"] === "table" ? "table" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Issue Explorer — CivicLens" },
      { name: "description", content: "Search and filter civic issue reports by category, status and priority." },
      { property: "og:title", content: "Issue Explorer — CivicLens" },
      { property: "og:description", content: "Browse every civic issue report in CivicLens." },
    ],
  }),
  component: Explorer,
});

const ALL = "all";

function Explorer() {
  const { reports } = useReports();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/issues/" });
  const set = (patch: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const filtered = useMemo(() => {
    const q = (search.q ?? "").toLowerCase().trim();
    return reports
      .filter((r) => !search.category || r.category === search.category)
      .filter((r) => !search.status || (search.status === "open" ? r.status !== "Resolved" : r.status === search.status))
      .filter((r) => !search.priority || r.priority === search.priority)
      .filter((r) => !q || [r.id, r.description, CATEGORY_LABELS[r.category], r.location].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => (search.sort === "old" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
  }, [reports, search]);

  const hasFilters = !!(search.q || search.category || search.status || search.priority);
  const view = search.view ?? "grid";

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Issue Explorer"
        description="Search, filter and review every report submitted in this browser."
        actions={<Button variant="hero" asChild><Link to="/report"><FilePlus2 /> Report Issue</Link></Button>}
      />

      <div className="card-surface mb-6 flex flex-col gap-3 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search reports" placeholder="Search by ID, description, category or location…" value={search.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} className="h-10 pl-9" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
          <Select value={search.category ?? ALL} onValueChange={(v) => set({ category: v === ALL ? undefined : v })}>
            <SelectTrigger aria-label="Category filter" className="md:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={search.status ?? ALL} onValueChange={(v) => set({ status: v === ALL ? undefined : v })}>
            <SelectTrigger aria-label="Status filter" className="md:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="open">Open (not resolved)</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={search.priority ?? ALL} onValueChange={(v) => set({ priority: v === ALL ? undefined : v })}>
            <SelectTrigger aria-label="Priority filter" className="md:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All priorities</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={search.sort ?? "new"} onValueChange={(v) => set({ sort: v === "old" ? "old" : undefined })}>
            <SelectTrigger aria-label="Sort order" className="md:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest first</SelectItem>
              <SelectItem value="old">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <div className="col-span-2 flex items-center justify-between gap-2 md:ml-auto">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => navigate({ search: { view: search.view }, replace: true })}><X /> Clear filters</Button>
            )}
            <div className="ml-auto flex rounded-lg border p-0.5" role="group" aria-label="View mode">
              {(["grid", "table"] as const).map((v) => (
                <button key={v} aria-pressed={view === v} aria-label={`${v} view`} onClick={() => set({ view: v === "table" ? "table" : undefined })} className={cn("grid h-8 w-9 place-items-center rounded-md transition-colors", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                  {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{filtered.length} report{filtered.length === 1 ? "" : "s"}</p>

      {filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><SearchX className="h-6 w-6" /></span>
          <h2 className="mt-4 text-lg font-semibold">No reports match</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try a different search or clear the filters to see all reports.</p>
          <Button className="mt-5" variant="outline" onClick={() => navigate({ search: {}, replace: true })}>Clear filters</Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <article key={r.id} className="card-surface group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="relative">
                <ReportImage src={r.imageUrl} alt={CATEGORY_LABELS[r.category]} className="aspect-[16/10] w-full" />
                <div className="absolute left-3 top-3"><StatusBadge status={r.status} /></div>
                {r.isDemo && <div className="absolute right-3 top-3"><DemoTag>Demo data</DemoTag></div>}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{r.id}</span>
                  <PriorityBadge priority={r.priority} />
                </div>
                <h3 className="mt-2 font-semibold">{CATEGORY_LABELS[r.category]}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{r.location}</span></p>
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
                  <Button size="sm" variant="outline" asChild><Link to="/issues/$id" params={{ id: r.id }}>View Details</Link></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Report</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Priority</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Date</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><ReportImage src={r.imageUrl} alt="" className="h-10 w-14 rounded-md" /><span className="font-mono text-xs font-semibold">{r.id}</span></div></td>
                  <td className="px-3 py-3">{CATEGORY_LABELS[r.category]}</td>
                  <td className="max-w-[220px] truncate px-3 py-3 text-muted-foreground">{r.location}</td>
                  <td className="px-3 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" asChild><Link to="/issues/$id" params={{ id: r.id }}>View Details</Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
