import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, MapPin, Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, PriorityBadge } from "@/components/ReportBits";
import { CATEGORIES, CATEGORY_LABELS, type IssueCategory, type IssueAnalysis } from "@/types/report";
import { api, isBackendConfigured } from "@/services/api";
import { useReports } from "@/hooks/useReports";
import { demoAnalyze } from "@/services/mockAnalysis";

const reportSchema = z.object({
  category: z.enum(["pothole", "garbage", "streetlight", "water", "drainage", "other"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report Issue — CivicLens" },
      { name: "description", content: "Submit a new civic issue report with AI-powered analysis." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<IssueAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { createReport, language } = useReports();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      category: "other",
      description: "",
      location: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const onAnalyze = async (values: ReportFormValues) => {
    if (!file) {
      toast.error("Please upload a photo of the issue");
      return;
    }

    setIsAnalyzing(true);
    try {
      if (isBackendConfigured()) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("description", values.description);
        formData.append("category", values.category);
        formData.append("location", values.location);

        const result = await api.analyzeIssue(formData);
        setAnalysis(result);
      } else {
        // Fallback to demo analysis
        const result = await demoAnalyze({
          category: values.category,
          description: values.description,
          location: values.location,
        });
        setAnalysis(result);
      }
      setStep(2);
      toast.success("AI analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async () => {
    if (!analysis) return;
    
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      const reportInput = {
        ...values,
        imageUrl: preview || "",
        priority: analysis.priority,
        analysis,
        language,
      };

      if (isBackendConfigured()) {
        await api.createReport(reportInput);
      } else {
        createReport(reportInput);
      }

      toast.success("Report submitted successfully!");
      navigate({ to: "/issues" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up mx-auto max-w-3xl">
      <PageHeader 
        title="Report a civic issue" 
        description="Upload a photo and describe the problem. Our AI will analyze it to help municipal authorities act faster."
      />

      {step === 1 ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-6">
            <Panel title="Issue Details">
              <div className="grid gap-6">
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 py-10 text-center transition-colors hover:bg-muted/50">
                  {preview ? (
                    <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl shadow-elevated">
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="absolute bottom-3 right-3"
                        onClick={() => { setFile(null); setPreview(null); }}
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Camera className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="font-semibold">Take or upload a photo</p>
                        <p className="text-sm text-muted-foreground">Clear photo helps AI identify the issue better</p>
                      </div>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="photo-upload" 
                        onChange={handleFileChange}
                      />
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="photo-upload" className="cursor-pointer">Select Image</label>
                      </Button>
                    </>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's the problem?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the issue in detail (e.g. 'Large pothole in middle of the road near school entrance...')" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Street name, landmark, area..." className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>Approximate address or nearby landmark</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Panel>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isAnalyzing} className="w-full sm:w-auto">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    Analyze Issue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <Panel title="AI Analysis Results" action={<CheckCircle2 className="h-5 w-5 text-success" />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Priority Level</p>
                  <div className="mt-1"><PriorityBadge priority={analysis?.priority || "Medium"} /></div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Identified Category</p>
                  <p className="mt-1 font-semibold text-foreground">{CATEGORY_LABELS[analysis?.suggestedCategory || "other"]}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Summary</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{analysis?.summary}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Visible Evidence</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {analysis?.evidence.map((e, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Next Steps</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {analysis?.nextSteps.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-semibold text-foreground">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="flex gap-2 text-sm italic text-muted-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {analysis?.humanReview}
                </p>
              </div>
            </div>
          </Panel>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to edit
            </Button>
            <Button size="lg" onClick={onSubmit} disabled={isSubmitting} className="sm:px-10">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm & Submit Report"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
