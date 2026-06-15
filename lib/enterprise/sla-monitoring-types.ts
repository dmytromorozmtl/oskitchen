import type { SLA_MONITORING_POLICY_ID } from "@/lib/enterprise/sla-monitoring-policy";

export type SlaAlertSeverity = "warning" | "critical";

export type SlaMonitoringAlert = {
  id: string;
  signal: string;
  severity: SlaAlertSeverity;
  title: string;
  detail: string;
  href: string | null;
};

export type SlaSignalSnapshot = {
  id: string;
  label: string;
  status: "healthy" | "degraded" | "down";
  uptimePct: number | null;
  responseTimeMs: number | null;
  detail: string;
};

export type SlaMonitoringDashboard = {
  policyId: typeof SLA_MONITORING_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  targets: {
    uptimePct: number;
    responseTimeMs: number;
    integrationP95Ms: number;
  };
  summary: {
    uptimePct: number;
    databaseLatencyMs: number;
    integrationFleetScore: number;
    healthyIntegrations: number;
    criticalIntegrations: number;
    cronHealthy: number;
    cronTotal: number;
    failedWebhooks: number;
    alertCount: number;
  };
  signals: SlaSignalSnapshot[];
  alerts: SlaMonitoringAlert[];
  warnings: string[];
  basePath: string;
};
