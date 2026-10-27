import type { CivicReport, IssueCategory } from "@/types/report";

const STOP = new Set(["the", "a", "an", "and", "is", "of", "on", "in", "near", "to", "for", "at", "with", "has", "not", "been", "this", "that", "are", "it", "from", "road"]);

export const tokens = (s: string) =>
  new Set(s.toLowerCase().split(/[^a-z0-9\u0900-\u097f]+/).filter((w) => w.length > 2 && !STOP.has(w)));

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((w) => b.has(w) && inter++);
  return inter / (a.size + b.size - inter);
}

/** Basic heuristic only — not a verified AI duplicate detector. */
export function findSimilarReports(
  reports: CivicReport[],
  input: { category: IssueCategory; description: string; location: string },
) {
  const d = tokens(input.description);
  const l = tokens(input.location);
  return reports
    .filter((r) => r.category === input.category && r.status !== "Resolved")
    .map((r) => {
      const ds = jaccard(d, tokens(r.description));
      const ls = l.size ? jaccard(l, tokens(r.location)) : 0;
      return { report: r, score: ds * 0.6 + ls * 0.4 };
    })
    .filter((x) => x.score >= 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
