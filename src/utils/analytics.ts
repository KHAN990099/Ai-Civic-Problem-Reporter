import { CATEGORIES, CATEGORY_LABELS, PRIORITIES, STATUSES, type CivicReport } from "@/types/report";

export function getAnalytics(reports: CivicReport[], days = 14, now = new Date()) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status !== "Resolved").length;
  const resolved = total - pending;
  const highOpen = reports.filter((r) => r.priority === "High" && r.status !== "Resolved").length;

  const daily: { date: string; label: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    daily.push({ date: key, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), count: 0 });
  }
  reports.forEach((r) => {
    const d = new Date(r.createdAt);
    d.setHours(0, 0, 0, 0);
    const slot = daily.find((x) => x.date === d.toISOString().slice(0, 10));
    if (slot) slot.count++;
  });

  const byCategory = CATEGORIES.map((c) => ({ key: c, name: CATEGORY_LABELS[c], count: reports.filter((r) => r.category === c).length }));
  const byStatus = STATUSES.map((s) => ({ name: s, count: reports.filter((r) => r.status === s).length }));
  const byPriority = PRIORITIES.map((p) => ({ name: p, count: reports.filter((r) => r.priority === p).length }));
  const last7 = daily.slice(-7).reduce((a, b) => a + b.count, 0);
  const prev7 = daily.slice(0, 7).reduce((a, b) => a + b.count, 0);

  return { total, pending, resolved, highOpen, daily, byCategory, byStatus, byPriority, last7, prev7, resolutionRate: total ? Math.round((resolved / total) * 100) : 0 };
}
