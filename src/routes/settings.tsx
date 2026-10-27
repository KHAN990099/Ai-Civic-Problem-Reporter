import { createFileRoute } from "@tanstack/react-router";
import { Database, FlaskConical, Info, Languages, RotateCcw, Server } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReports } from "@/hooks/useReports";
import { DemoTag, PageHeader, Panel } from "@/components/ReportBits";
import { isBackendConfigured } from "@/services/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CivicLens" },
      { name: "description", content: "Language preference, demo mode and browser data settings for CivicLens." },
      { property: "og:title", content: "Settings — CivicLens" },
      { property: "og:description", content: "Manage CivicLens demo data and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { reports, resetDemoData, language, setLanguage } = useReports();
  const mine = reports.filter((r) => !r.isDemo).length;
  return (
    <div className="animate-fade-up">
      <PageHeader title="Settings" description="Preferences and demo data for this browser." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Application" action={<DemoTag>Demo mode</DemoTag>}>
          <div className="space-y-3 text-sm">
            <p className="flex gap-2"><Info className="h-4 w-4 shrink-0 text-primary" /> CivicLens v0.1 — hackathon build of an AI-powered civic problem reporter.</p>
            <p className="flex gap-2"><FlaskConical className="h-4 w-4 shrink-0 text-primary" /> Issue analysis is a simulated keyword heuristic labelled DEMO ANALYSIS. Gemma 4 is not connected yet.</p>
            <p className="flex gap-2"><Server className="h-4 w-4 shrink-0 text-primary" /> Backend: {isBackendConfigured() ? "VITE_API_BASE_URL is set (not yet used)" : "not configured — running fully in the browser"}.</p>
          </div>
        </Panel>
        <Panel title="Language preference" subtitle="Default language for new reports">
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <Select value={language} onValueChange={(v) => { setLanguage(v as "en" | "hi"); toast.success("Language preference saved"); }}>
              <SelectTrigger aria-label="Language" className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Panel>
        <Panel title="Data persistence" className="lg:col-span-2">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <Database className="h-5 w-5 shrink-0 text-primary" />
            <p>All reports are saved in this browser's local storage. They are not uploaded anywhere and are not shared with other users or devices. Clearing browser data removes them. Currently stored: <strong className="text-foreground">{reports.length} reports</strong> ({mine} created by you).</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-danger-soft p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">Reset demo data</p>
              <p className="text-sm text-muted-foreground">Restores the original sample reports and deletes reports you created.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive"><RotateCcw /> Reset Demo Data</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                  <AlertDialogDescription>This deletes {mine} report{mine === 1 ? "" : "s"} you created and restores the original sample reports. This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => { await resetDemoData(); toast.success("Demo data restored"); }}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Panel>
      </div>
    </div>
  );
}
