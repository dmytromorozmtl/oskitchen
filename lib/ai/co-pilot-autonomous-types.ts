import type { CoPilotCategory, CoPilotRecommendation } from "@/lib/ai/co-pilot-types";

export type CoPilotAutonomousSettings = {
  enabled: boolean;
  autoRunSafeActions: boolean;
  lastDigestAt: string | null;
  lastRunAt: string | null;
};

export type CoPilotDigestSection = {
  id: string;
  title: string;
  body: string;
  itemCount: number;
};

export type CoPilotDailyDigest = {
  date: string;
  headline: string;
  generatedAt: string;
  sections: CoPilotDigestSection[];
  stats: {
    recommendationsScanned: number;
    criticalCount: number;
    warningCount: number;
    autoExecuted: number;
    pendingApproval: number;
    exceptionsLogged: number;
  };
};

export type CoPilotExceptionSeverity = "critical" | "warning" | "info";

export type CoPilotExceptionEntry = {
  id: string;
  at: string;
  severity: CoPilotExceptionSeverity;
  category: CoPilotCategory | "system";
  title: string;
  detail: string;
  resolved: boolean;
  source: "recommendation" | "autonomous_run" | "execution_failure";
};

export type CoPilotAutonomousDashboard = {
  settings: CoPilotAutonomousSettings;
  digest: CoPilotDailyDigest;
  exceptions: CoPilotExceptionEntry[];
  recentRecommendations: CoPilotRecommendation[];
  scannedAt: string;
};

export const DEFAULT_CO_PILOT_AUTONOMOUS_SETTINGS: CoPilotAutonomousSettings = {
  enabled: false,
  autoRunSafeActions: true,
  lastDigestAt: null,
  lastRunAt: null,
};
