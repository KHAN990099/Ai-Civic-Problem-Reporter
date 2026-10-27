import { z } from 'zod';

export const IssueCategorySchema = z.enum([
  "pothole",
  "garbage",
  "streetlight",
  "water",
  "drainage",
  "other"
]);

export const PrioritySchema = z.enum(["Low", "Medium", "High"]);
export const ReportStatusSchema = z.enum(["Submitted", "Under Review", "Resolved"]);

export const AnalyzeRequestSchema = z.object({
  description: z.string().min(5),
  category: IssueCategorySchema,
  location: z.string().optional(),
});

export const CreateReportSchema = z.object({
  description: z.string().min(5),
  category: IssueCategorySchema,
  location: z.string().min(3),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageUrl: z.string(),
  priority: PrioritySchema,
  analysis: z.object({
    suggestedCategory: IssueCategorySchema,
    evidence: z.array(z.string()),
    priority: PrioritySchema,
    nextSteps: z.array(z.string()),
    humanReview: z.string(),
    summary: z.string(),
    mode: z.enum(["DEMO", "REAL"])
  }).optional(),
  language: z.enum(["en", "hi"]).default("en"),
});

export const UpdateStatusSchema = z.object({
  status: ReportStatusSchema,
});
