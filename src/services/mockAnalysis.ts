import type { IssueAnalysis, IssueCategory, Priority } from "@/types/report";

/**
 * DEMO analysis: a keyword heuristic over the user's text and chosen category.
 * It does NOT look at the image and is NOT Gemma 4. Replace with
 * apiAnalyzeIssue() in services/api.ts once the backend exists.
 */
const KEYWORDS: Record<Exclude<IssueCategory, "other">, string[]> = {
  pothole: ["pothole", "road", "crack", "gadda", "गड्ढा", "सड़क", "asphalt", "broken road"],
  garbage: ["garbage", "trash", "waste", "dump", "bin", "smell", "कचरा", "litter"],
  streetlight: ["light", "lamp", "dark", "pole", "बत्ती", "streetlight", "bulb"],
  water: ["leak", "pipe", "water", "burst", "पानी", "valve", "tap"],
  drainage: ["drain", "sewer", "overflow", "clog", "नाली", "blocked", "stagnant"],
};

const URGENT = ["danger", "accident", "child", "school", "hospital", "deep", "burst", "night", "injur", "open", "electric", "week", "flood", "खतरा"];

const STEPS: Record<IssueCategory, string[]> = {
  pothole: ["Barricade or mark the damaged stretch", "Schedule road patching with the roads department", "Inspect nearby surface after repair"],
  garbage: ["Dispatch a sanitation pickup", "Check bin capacity and collection schedule", "Consider awareness signage at the spot"],
  streetlight: ["Assign an electrician to inspect the pole and lamp", "Check wiring for exposed electrical hazard", "Restore lighting and verify at night"],
  water: ["Notify the water supply board", "Isolate the leaking valve or pipe section", "Repair and check pressure after fix"],
  drainage: ["Send a desilting crew to clear the blockage", "Cover any open drain sections", "Monitor during the next rainfall"],
  other: ["Forward to the relevant ward office", "Request an on-site inspection", "Update the citizen after assessment"],
};

export function demoAnalyze(input: { category: IssueCategory; description: string; location?: string }): IssueAnalysis {
  const text = input.description.toLowerCase();
  let best: IssueCategory = input.category;
  let bestScore = 0;
  (Object.keys(KEYWORDS) as (keyof typeof KEYWORDS)[]).forEach((cat) => {
    const score = KEYWORDS[cat].filter((k) => text.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  });
  if (bestScore === 0) best = input.category;

  const urgentHits = URGENT.filter((u) => text.includes(u));
  const base: Record<IssueCategory, number> = { pothole: 2, streetlight: 2, water: 2, drainage: 2, garbage: 1, other: 1 };
  const score = base[best] + urgentHits.length + (text.length > 140 ? 1 : 0);
  const priority: Priority = score >= 4 ? "High" : score >= 2 ? "Medium" : "Low";

  const evidence = [
    `User-reported description: "${input.description.trim().slice(0, 120)}${input.description.length > 120 ? "…" : ""}"`,
    `Selected category: ${input.category}${best !== input.category ? ` (description keywords suggest "${best}")` : ""}`,
  ];
  if (urgentHits.length) evidence.push(`Urgency keywords found: ${urgentHits.join(", ")}`);
  if (input.location) evidence.push(`Location provided: ${input.location}`);
  evidence.push("Photo attached but not interpreted in demo mode");

  return {
    suggestedCategory: best,
    evidence,
    priority,
    nextSteps: STEPS[best],
    humanReview:
      priority === "High"
        ? "Recommended: a municipal officer should verify this quickly due to possible safety risk."
        : "Recommended: standard human verification before assignment.",
    summary: `Simulated assessment based on text keywords suggests a ${priority.toLowerCase()}-priority ${best} issue.`,
    mode: "DEMO",
  };
}

export async function analyzeIssueDemo(input: { category: IssueCategory; description: string; location?: string }) {
  await new Promise((r) => setTimeout(r, 1100));
  return demoAnalyze(input);
}
