import type { ENTERPRISE_COMMISSARY_POLICY_ID } from "@/lib/enterprise/commissary-policy";

export type CommissaryPillar = "production" | "purchasing" | "delivery" | "distribution";

export type CommissaryPillarStatus = "healthy" | "watch" | "critical" | "idle";

export type CommissaryPillarSnapshot = {
  pillar: CommissaryPillar;
  label: string;
  status: CommissaryPillarStatus;
  headline: string;
  metrics: { label: string; value: string | number }[];
  recommendation: string;
  href: string;
};

export type CommissaryTransferSummary = {
  id: string;
  status: string;
  lineCount: number;
  createdAtIso: string;
};

export type CommissaryProductionTask = {
  id: string;
  title: string;
  planDateIso: string;
  status: string;
  batchSize: number | null;
};

export type CommissaryAlertSeverity = "warning" | "info";

export type CommissaryAlert = {
  id: string;
  pillar: CommissaryPillar;
  severity: CommissaryAlertSeverity;
  message: string;
};

export type EnterpriseCommissaryDashboard = {
  policyId: typeof ENTERPRISE_COMMISSARY_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  weekStartIso: string;
  pillars: CommissaryPillarSnapshot[];
  recentTransfers: CommissaryTransferSummary[];
  upcomingProduction: CommissaryProductionTask[];
  alerts: CommissaryAlert[];
  summary: {
    locationCount: number;
    pendingTransfers: number;
    openPurchaseOrders: number;
    reorderQueueOpen: number;
    productionTasksThisWeek: number;
    routesPlannedToday: number;
    stopsNotPacked: number;
  };
  basePath: string;
};
