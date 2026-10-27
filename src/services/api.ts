/**
 * Future backend layer (Node.js/Express). Not used in demo mode.
 * Set VITE_API_BASE_URL to enable. Never put API keys in VITE_* vars —
 * the Gemma 4 key belongs on the backend only.
 */
import type { CivicReport, IssueAnalysis, NewReportInput, ReportStatus } from "@/types/report";

export const API_BASE_URL: string | undefined = import.meta.env["VITE_API_BASE_URL"];
export const isBackendConfigured = () => Boolean(API_BASE_URL);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error("Backend not configured (VITE_API_BASE_URL missing)");
  
  const headers: HeadersInit = { ...init?.headers };
  if (!(init?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  analyzeIssue: (formData: FormData) =>
    request<IssueAnalysis>("/api/reports/analyze", { 
      method: "POST", 
      body: formData,
      headers: {} // Let browser set boundary for FormData
    }),
  createReport: (body: NewReportInput) => request<CivicReport>("/api/reports", { method: "POST", body: JSON.stringify(body) }),
  getReports: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<CivicReport[]>(`/api/reports${qs}`);
  },
  getReportById: (id: string) => request<CivicReport>(`/api/reports/${encodeURIComponent(id)}`),
  updateReportStatus: (id: string, status: ReportStatus) =>
    request<CivicReport>(`/api/reports/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getAnalytics: () => request<any>("/api/reports/meta/analytics"),
  resetDemoData: () => request<{ message: string }>("/api/reports/demo/reset", { method: "POST" }),
};
