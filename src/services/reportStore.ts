import { buildSeedReports } from "@/data/seed";
import type { CivicReport, NewReportInput, ReportStatus } from "@/types/report";

/** Browser-local persistence. Data lives only in this browser; not shared between users. */
export const STORAGE_KEY = "civiclens.reports.v1";

function isValid(x: unknown): x is CivicReport[] {
  return Array.isArray(x) && x.every((r) => r && typeof r.id === "string" && typeof r.status === "string" && Array.isArray(r.statusHistory));
}

export function loadReports(): CivicReport[] {
  if (typeof window === "undefined") return buildSeedReports();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValid(parsed)) return parsed;
    }
  } catch {
    /* corrupted data falls through to reseed */
  }
  const seeded = buildSeedReports();
  saveReports(seeded);
  return seeded;
}

export function saveReports(reports: CivicReport[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    throw new Error("Browser storage is full. Try a smaller photo or reset demo data.");
  }
}

export function generateId(existing: CivicReport[]): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  let id: string;
  do {
    id = `CL-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  } while (existing.some((r) => r.id === id));
  return id;
}

export function createReportIn(reports: CivicReport[], input: NewReportInput): CivicReport {
  const now = new Date().toISOString();
  return {
    ...input,
    id: generateId(reports),
    status: "Submitted",
    createdAt: now,
    updatedAt: now,
    statusHistory: [{ status: "Submitted", at: now, note: "Report submitted by citizen" }],
    isDemo: false,
    analysisMode: input.analysis?.mode ?? "DEMO",
  };
}

export function withStatus(report: CivicReport, status: ReportStatus): CivicReport {
  const now = new Date().toISOString();
  return {
    ...report,
    status,
    updatedAt: now,
    statusHistory: [...report.statusHistory, { status, at: now, note: `Status changed to ${status}` }],
  };
}

export function resetToSeed(): CivicReport[] {
  const seeded = buildSeedReports();
  saveReports(seeded);
  return seeded;
}
