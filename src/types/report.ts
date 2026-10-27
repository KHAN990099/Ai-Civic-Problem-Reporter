export type IssueCategory =
  | "pothole"
  | "garbage"
  | "streetlight"
  | "water"
  | "drainage"
  | "other";

export type Priority = "Low" | "Medium" | "High";
export type ReportStatus = "Submitted" | "Under Review" | "Resolved";
export type AnalysisMode = "DEMO" | "REAL";
export type Language = "en" | "hi";

export interface IssueAnalysis {
  suggestedCategory: IssueCategory;
  evidence: string[];
  priority: Priority;
  nextSteps: string[];
  humanReview: string;
  summary: string;
  mode: AnalysisMode;
}

export interface StatusEvent {
  status: ReportStatus;
  at: string;
  note?: string;
}

export interface CivicReport {
  id: string;
  description: string;
  category: IssueCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  priority: Priority;
  status: ReportStatus;
  analysis?: IssueAnalysis;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusEvent[];
  isDemo: boolean; // true = seeded sample data
  analysisMode: AnalysisMode;
  language: Language;
}

export interface NewReportInput {
  description: string;
  category: IssueCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  priority: Priority;
  analysis?: IssueAnalysis;
  language: Language;
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole: "Pothole / Road Damage",
  garbage: "Garbage Accumulation",
  streetlight: "Broken Streetlight",
  water: "Water Leakage",
  drainage: "Drainage Problem",
  other: "Other",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as IssueCategory[];
export const STATUSES: ReportStatus[] = ["Submitted", "Under Review", "Resolved"];
export const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
