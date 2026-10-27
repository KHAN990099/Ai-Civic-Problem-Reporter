import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CivicReport, Language, NewReportInput, ReportStatus } from "@/types/report";
import { createReportIn, loadReports as loadLocalReports, resetToSeed as resetLocalSeed, saveReports as saveLocalReports, withStatus as withLocalStatus } from "@/services/reportStore";
import { getAnalytics } from "@/utils/analytics";
import { api, isBackendConfigured } from "@/services/api";

interface Ctx {
  reports: CivicReport[];
  ready: boolean;
  getReportById: (id: string) => CivicReport | undefined;
  createReport: (input: NewReportInput) => Promise<CivicReport>;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;
  resetDemoData: () => Promise<void>;
  analytics: ReturnType<typeof getAnalytics>;
  language: Language;
  setLanguage: (l: Language) => void;
  refresh: () => Promise<void>;
}

const ReportsContext = createContext<Ctx | null>(null);
const LANG_KEY = "civiclens.lang";

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [ready, setReady] = useState(false);
  const [language, setLang] = useState<Language>("en");

  const refresh = useCallback(async () => {
    if (isBackendConfigured()) {
      try {
        const data = await api.getReports();
        setReports(data);
      } catch (e) {
        console.error("Failed to fetch reports from backend", e);
      }
    } else {
      setReports(loadLocalReports());
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await refresh();
      const l = window.localStorage.getItem(LANG_KEY);
      if (l === "en" || l === "hi") setLang(l);
      setReady(true);
    };
    init();
  }, [refresh]);

  const createReport = useCallback(async (input: NewReportInput) => {
    let report: CivicReport;
    if (isBackendConfigured()) {
      report = await api.createReport(input);
      await refresh();
    } else {
      const current = loadLocalReports();
      report = createReportIn(current, input);
      const next = [report, ...current];
      saveLocalReports(next);
      setReports(next);
    }
    return report;
  }, [refresh]);

  const updateReportStatus = useCallback(async (id: string, status: ReportStatus) => {
    if (isBackendConfigured()) {
      await api.updateReportStatus(id, status);
      await refresh();
    } else {
      setReports((prev) => {
        const next = prev.map((r) => (r.id === id && r.status !== status ? withLocalStatus(r, status) : r));
        saveLocalReports(next);
        return next;
      });
    }
  }, [refresh]);

  const resetDemoData = useCallback(async () => {
    if (isBackendConfigured()) {
      await api.resetDemoData();
      await refresh();
    } else {
      setReports(resetLocalSeed());
    }
  }, [refresh]);

  const value = useMemo<Ctx>(
    () => ({
      reports,
      ready,
      getReportById: (id) => reports.find((r) => r.id === id),
      createReport,
      updateReportStatus,
      resetDemoData,
      analytics: getAnalytics(reports),
      language,
      setLanguage: (l) => {
        setLang(l);
        window.localStorage.setItem(LANG_KEY, l);
      },
      refresh,
    }),
    [reports, ready, createReport, updateReportStatus, resetDemoData, language, refresh],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used inside ReportsProvider");
  return ctx;
}
