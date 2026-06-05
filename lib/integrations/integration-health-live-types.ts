import type { IntegrationHealthScoreBand } from "@/lib/integration-health/health-scoring-policy";
import type { IntegrationHealthTrend } from "@/services/integration-health/health-scoring-engine";

export type LiveIntegrationHealthAlert = {
  id: string;
  integrationId: string;
  severity: "warning" | "critical";
  code:
    | "env_missing"
    | "not_connected"
    | "score_critical"
    | "score_declining"
    | "sync_stale"
    | "webhook_failures"
    | "latency_spike"
    | "auth_degraded";
  message: string;
};

export type LiveIntegrationHealthRow = {
  integrationId: string;
  name: string;
  setupRoute: string;
  healthScore: number;
  band: IntegrationHealthScoreBand;
  envStatus: "ready" | "optional" | "missing";
  configuredEnvCount: number;
  requiredEnvCount: number;
  connectionStatus: "CONNECTED" | "NEEDS_AUTH" | "ERROR" | "DISABLED" | "none";
  connectionName: string | null;
  trend: IntegrationHealthTrend;
  alerts: LiveIntegrationHealthAlert[];
};

export type LiveIntegrationHealthDashboard = {
  policyId: string;
  generatedAtIso: string;
  expectedLiveCount: number;
  monitoredCount: number;
  fleetScore: number;
  fleetBand: IntegrationHealthScoreBand;
  healthyCount: number;
  watchCount: number;
  criticalCount: number;
  rows: LiveIntegrationHealthRow[];
  alerts: LiveIntegrationHealthAlert[];
};
