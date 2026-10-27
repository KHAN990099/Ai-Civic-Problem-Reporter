import pothole from "@/assets/pothole.jpg";
import garbage from "@/assets/garbage.jpg";
import streetlight from "@/assets/streetlight.jpg";
import water from "@/assets/water.jpg";
import drain from "@/assets/drain.jpg";
import type { CivicReport, IssueCategory, Priority, ReportStatus } from "@/types/report";
import { demoAnalyze } from "@/services/mockAnalysis";

export const CATEGORY_IMAGES: Record<IssueCategory, string> = {
  pothole,
  garbage,
  streetlight,
  water,
  drainage: drain,
  other: pothole,
};

type Seed = [IssueCategory, string, string, Priority, ReportStatus, number];

const SEEDS: Seed[] = [
  ["pothole", "Deep pothole near the bus stop filled with rainwater; two-wheelers swerving dangerously.", "MG Road, near Trinity Metro, Bengaluru", "High", "Under Review", 1],
  ["garbage", "Garbage pile has not been cleared for a week, foul smell and stray dogs around.", "Sector 15 market lane, Noida", "Medium", "Submitted", 2],
  ["streetlight", "Streetlight pole is leaning and the lamp is not working, street is dark at night.", "4th Cross, Indiranagar, Bengaluru", "High", "Submitted", 3],
  ["water", "Burst pipe on footpath wasting water continuously since morning.", "Linking Road, Bandra West, Mumbai", "High", "Resolved", 4],
  ["drainage", "Roadside drain blocked with plastic, water overflowing onto road.", "Lajpat Nagar II, New Delhi", "Medium", "Under Review", 5],
  ["pothole", "Series of small potholes on the service road causing traffic slowdowns.", "Anna Salai service road, Chennai", "Medium", "Resolved", 7],
  ["garbage", "Overflowing community bin near school gate.", "Kothrud, near Karve Road, Pune", "Low", "Resolved", 8],
  ["streetlight", "Three consecutive streetlights not working in residential lane.", "Salt Lake Sector V, Kolkata", "Medium", "Submitted", 9],
  ["water", "Small leak from municipal valve forming a puddle.", "Banjara Hills Road No. 12, Hyderabad", "Low", "Under Review", 11],
  ["drainage", "Open drain cover missing, risk for pedestrians at night.", "Gandhi Nagar, Jaipur", "High", "Submitted", 12],
  ["pothole", "Road surface broken after cable work, not repaired.", "Ashram Road, Ahmedabad", "Medium", "Submitted", 13],
  ["other", "Fallen tree branch partially blocking the footpath.", "Civil Lines, Nagpur", "Low", "Resolved", 14],
];

export function buildSeedReports(now = Date.now()): CivicReport[] {
  return SEEDS.map(([category, description, location, priority, status, daysAgo], i) => {
    const created = new Date(now - daysAgo * 86400000 - i * 3600000).toISOString();
    const history: CivicReport["statusHistory"] = [{ status: "Submitted", at: created, note: "Report submitted" }];
    if (status !== "Submitted") {
      history.push({ status: "Under Review", at: new Date(Date.parse(created) + 86400000 * 0.5).toISOString(), note: "Marked for review" });
    }
    if (status === "Resolved") {
      history.push({ status: "Resolved", at: new Date(Date.parse(created) + 86400000 * 0.9).toISOString(), note: "Marked as resolved (demo)" });
    }
    const analysis = demoAnalyze({ category, description, location });
    return {
      id: `CL-DEMO-${String(i + 1).padStart(3, "0")}`,
      description,
      category,
      location,
      imageUrl: CATEGORY_IMAGES[category],
      priority,
      status,
      analysis: { ...analysis, priority },
      createdAt: created,
      updatedAt: history[history.length - 1]!.at,
      statusHistory: history,
      isDemo: true,
      analysisMode: "DEMO",
      language: "en",
    };
  });
}
