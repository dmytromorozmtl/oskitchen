/**
 * LIVE integration health dashboard — scores, trends, and alerts for every LIVE registry entry.
 */

import {
  bandFromScore,
  type IntegrationHealthScoreBand,
} from "@/lib/integration-health/health-scoring-policy";
import { evaluateBetaIntegrationEnvReadiness } from "@/lib/integrations/beta-integration-env-readiness";
import {
  INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT,
  INTEGRATION_HEALTH_LIVE_POLICY_ID,
} from "@/lib/integrations/integration-health-live-policy";
import type {
  LiveIntegrationHealthAlert,
  LiveIntegrationHealthDashboard,
  LiveIntegrationHealthRow,
} from "@/lib/integrations/integration-health-live-types";
import {
  INTEGRATION_REGISTRY,
  LIVE_INTEGRATION_IDS,
} from "@/lib/integrations/integration-registry";
import { providerForLiveIntegrationId } from "@/lib/integrations/live-integration-provider-map";
import {
  loadIntegrationHealthScoreboard,
  type IntegrationHealthScoreResult,
} from "@/services/integration-health/health-scoring-engine";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreFromEnvOnly(input: {
  envStatus: LiveIntegrationHealthRow["envStatus"];
  configuredEnvCount: number;
  requiredEnvCount: number;
}): number {
  if (input.envStatus === "ready") return 78;
  if (input.envStatus === "optional") return 72;
  if (input.requiredEnvCount <= 0) return 72;
  const ratio = input.configuredEnvCount / input.requiredEnvCount;
  return clampScore(35 + ratio * 40);
}

function mapConnectionAlert(
  integrationId: string,
  alert: IntegrationHealthScoreResult["alerts"][number],
): LiveIntegrationHealthAlert {
  return {
    id: `${integrationId}:${alert.id}`,
    integrationId,
    severity: alert.severity,
    code: alert.code,
    message: alert.message,
  };
}

function buildRow(
  integrationId: string,
  env: ReturnType<typeof evaluateBetaIntegrationEnvReadiness>,
  connection: IntegrationHealthScoreResult | undefined,
): LiveIntegrationHealthRow {
  const entry = INTEGRATION_REGISTRY.find((row) => row.id === integrationId);
  const name = entry?.name ?? integrationId;
  const setupRoute = entry?.setupRoute ?? `/dashboard/integrations/${integrationId}`;

  const envStatus = env.status;
  const configuredEnvCount = env.configuredCount;
  const requiredEnvCount = env.requiredCount;

  let healthScore = connection?.score ?? scoreFromEnvOnly({ envStatus, configuredEnvCount, requiredEnvCount });
  let band: IntegrationHealthScoreBand = connection?.band ?? bandFromScore(healthScore);
  const trend = connection?.trend ?? {
    direction: "insufficient_data" as const,
    delta7d: 0,
    recentScores: [],
  };

  const alerts: LiveIntegrationHealthAlert[] = [];

  if (envStatus === "missing" && env.missingEnv.length > 0) {
    alerts.push({
      id: `${integrationId}:env_missing`,
      integrationId,
      severity: "warning",
      code: "env_missing",
      message: `${name} missing env: ${env.missingEnv.join(", ")}`,
    });
    if (!connection) {
      healthScore = Math.min(healthScore, 55);
      band = bandFromScore(healthScore);
    }
  }

  if (!connection) {
    alerts.push({
      id: `${integrationId}:not_connected`,
      integrationId,
      severity: envStatus === "ready" ? "warning" : "critical",
      code: "not_connected",
      message: `${name} has no workspace connection — connect to start order and webhook flows.`,
    });
  } else {
    alerts.push(...connection.alerts.map((alert) => mapConnectionAlert(integrationId, alert)));
  }

  const connectionStatus = connection
    ? (connection.factors.connectionStatus as LiveIntegrationHealthRow["connectionStatus"])
    : "none";

  return {
    integrationId,
    name,
    setupRoute,
    healthScore,
    band,
    envStatus,
    configuredEnvCount,
    requiredEnvCount,
    connectionStatus,
    connectionName: connection?.connectionName ?? null,
    trend,
    alerts,
  };
}

export function buildLiveIntegrationHealthDashboard(input: {
  rows: LiveIntegrationHealthRow[];
  now?: Date;
}): LiveIntegrationHealthDashboard {
  const scores = input.rows.map((row) => row.healthScore);
  const fleetScore =
    scores.length > 0
      ? clampScore(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

  const healthyCount = input.rows.filter((row) => row.band === "healthy").length;
  const watchCount = input.rows.filter((row) => row.band === "watch").length;
  const criticalCount = input.rows.filter((row) => row.band === "critical").length;
  const alerts = input.rows.flatMap((row) => row.alerts);

  return {
    policyId: INTEGRATION_HEALTH_LIVE_POLICY_ID,
    generatedAtIso: (input.now ?? new Date()).toISOString(),
    expectedLiveCount: INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT,
    monitoredCount: input.rows.length,
    fleetScore,
    fleetBand: bandFromScore(fleetScore),
    healthyCount,
    watchCount,
    criticalCount,
    rows: input.rows,
    alerts,
  };
}

export async function loadLiveIntegrationHealthDashboard(
  userId: string,
): Promise<LiveIntegrationHealthDashboard> {
  const now = new Date();
  const scoreboard = await loadIntegrationHealthScoreboard(userId);

  const connectionByProvider = new Map<string, IntegrationHealthScoreResult>();
  for (const connection of scoreboard.connections) {
    if (!connectionByProvider.has(connection.provider)) {
      connectionByProvider.set(connection.provider, connection);
    }
  }

  const rows = LIVE_INTEGRATION_IDS.map((integrationId) => {
    const entry = INTEGRATION_REGISTRY.find((row) => row.id === integrationId);
    if (!entry) {
      throw new Error(`Missing LIVE registry entry: ${integrationId}`);
    }

    const env = evaluateBetaIntegrationEnvReadiness(entry);
    const provider = providerForLiveIntegrationId(integrationId);
    const connection = provider ? connectionByProvider.get(provider) : undefined;
    return buildRow(integrationId, env, connection);
  });

  return buildLiveIntegrationHealthDashboard({ rows, now });
}
