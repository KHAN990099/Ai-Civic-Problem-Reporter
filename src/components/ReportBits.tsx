import { useState, type ReactNode } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisMode, Priority, ReportStatus } from "@/types/report";

const STATUS_STYLES: Record<ReportStatus, string> = {
  Submitted: "bg-info-soft text-info",
  "Under Review": "bg-warning-soft text-warning",
  Resolved: "bg-success-soft text-success",
};
const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-danger-soft text-destructive",
  Medium: "bg-warning-soft text-warning",
  Low: "bg-muted text-muted-foreground",
};

const pill = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={cn(pill, STATUS_STYLES[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(pill, PRIORITY_STYLES[priority])}>{priority}</span>;
}
export function DemoTag({ mode = "DEMO", children }: { mode?: AnalysisMode; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", mode === "DEMO" ? "border-warning/40 bg-warning-soft text-warning" : "border-success/40 bg-success-soft text-success")}>
      {children ?? (mode === "DEMO" ? "Demo analysis" : "Real analysis")}
    </span>
  );
}

export function ReportImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src)
    return (
      <div className={cn("grid place-items-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="h-6 w-6" aria-label="Image unavailable" />
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn("object-cover", className)} />;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, children, className, action }: { title?: string; subtitle?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("card-surface p-5", className)}>
      {title && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
