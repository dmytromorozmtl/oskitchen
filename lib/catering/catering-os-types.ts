import type { CATERING_OS_POLICY_ID } from "@/lib/catering/catering-os-policy";

export type CateringOsModule = "events" | "clients" | "packing" | "routes";

export type CateringOsModuleStatus = "healthy" | "watch" | "critical" | "idle";

export type CateringOsModuleSnapshot = {
  module: CateringOsModule;
  label: string;
  status: CateringOsModuleStatus;
  headline: string;
  metrics: { label: string; value: string | number }[];
  recommendation: string;
  href: string;
};

export type CateringEventRow = {
  quoteId: string;
  eventName: string;
  customerName: string;
  eventDateIso: string;
  guestCount: number | null;
  status: string;
  total: number;
  deliveryRequired: boolean;
};

export type CateringClientRow = {
  key: string;
  displayName: string;
  email: string;
  quoteCount: number;
  pipelineValue: number;
  lastEventDateIso: string | null;
};

export type CateringOsAlertSeverity = "warning" | "info";

export type CateringOsAlert = {
  id: string;
  module: CateringOsModule;
  severity: CateringOsAlertSeverity;
  message: string;
};

export type CateringOsDashboard = {
  policyId: typeof CATERING_OS_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  modules: CateringOsModuleSnapshot[];
  upcomingEvents: CateringEventRow[];
  topClients: CateringClientRow[];
  alerts: CateringOsAlert[];
  summary: {
    openQuotes: number;
    acceptedQuotes: number;
    upcomingEvents: number;
    activeClients: number;
    packingTasksToday: number;
    routesPlannedToday: number;
    deliveryEvents: number;
    pipelineValue: number;
  };
  basePath: string;
};
