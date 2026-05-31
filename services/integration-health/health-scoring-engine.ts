/**
 * Integration health scoring engine — 0–100 score, trends, predictive alerts.
 *
 * Consumes connection status, health-check history, sync freshness, and webhook
 * reliability to produce an operator scoreboard for sales and support triage.
 *
 * @see docs/integration-health-sales-deck.md
 */

import {
  bandFromScore,
  INTEGRATION_HEALTH_LATENCY_WARN_MS,
  INTEGRATION_HEALTH_SCORING_POLICY_ID,
  INTEGRATION_HEALTH_SYNC_STALE_HOURS,
  INTEGRATION_HEALTH_WEBHOOK_FAIL_RATE_WARN,
  type IntegrationHealthScoreBand,
} from "@/lib/integration-health/health-scoring-policy";
import { describeIntegrationConnectionHealth } from "@/lib/integrations/integration-connection-health";
import { prisma } from "@/lib/prisma";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type IntegrationHealthStatusValue = "OK" | "DEGRADED" | "ERROR" | "UNKNOWN";

export type IntegrationHealthScoreFactors = {
  connectionStatus: string;
  credentialsPresent: boolean;
  lastHealthStatus: IntegrationHealthStatusValue;
  latencyMs: number | null;
  syncFreshnessHours: number | null;
  webhookFailRate7d: number;
  capabilityHeadline: string;
};

export type IntegrationHealthScoreResult = {
  connectionId: string;
  provider: string;
  connectionName: string;
  score: number;
  band: IntegrationHealthScoreBand;
  factors: IntegrationHealthScoreFactors;
  trend: IntegrationHealthTrend;
  alerts: IntegrationHealthPredictiveAlert[];
};

export type IntegrationHealthTrend = {
  direction: "improving" | "stable" | "declining" | "insufficient_data";
  delta7d: number;
  recentScores: number[];
};

export type IntegrationHealthPredictiveAlert = {
  id: string;
  connectionId: string;
  provider: string;
  severity: "warning" | "critical";
  code:
    | "score_critical"
    | "score_declining"
    | "sync_stale"
    | "webhook_failures"
    | "latency_spike"
    | "auth_degraded";
  message: string;
};

export type IntegrationHealthScoreboard = {
  policyId: typeof INTEGRATION_HEALTH_SCORING_POLICY_ID;
  generatedAtIso: string;
  workspaceScore: number;
  band: IntegrationHealthScoreBand;
  connections: IntegrationHealthScoreResult[];
  alerts: IntegrationHealthPredictiveAlert[];
  notes: string[];
};

export type IntegrationHealthSignalInput = {
  connectionId: string;
  provider: string;
  connectionName: string;
  connectionStatus: string;
  hasCredentials: boolean;
  lastHealthStatus?: IntegrationHealthStatusValue;
  latencyMs?: number | null;
  lastSyncAt?: Date | null;
  webhookEvents7d?: { total: number; failed: number };
  healthCheckHistory?: Array<{
    status: IntegrationHealthStatusValue;
    latencyMs: number | null;
    checkedAt: Date;
  }>;
  now?: Date;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hoursSince(date: Date | null | undefined, now: Date): number | null {
  if (!date) return null;
  return (now.getTime() - date.getTime()) / (60 * 60 * 1000);
}

function webhookFailRate(events: { total: number; failed: number } | undefined): number {
  if (!events || events.total <= 0) return 0;
  return events.failed / events.total;
}

/** Compute 0–100 health score for one integration connection. */
export function scoreIntegrationHealth(input: IntegrationHealthSignalInput): IntegrationHealthScoreResult {
  const now = input.now ?? new Date();
  const lastHealthStatus = input.lastHealthStatus ?? "UNKNOWN";
  const latencyMs = input.latencyMs ?? null;
  const syncFreshnessHours = hoursSince(input.lastSyncAt ?? null, now);
  const failRate = webhookFailRate(input.webhookEvents7d);

  const presentation = describeIntegrationConnectionHealth({
    provider: input.provider,
    connectionStatus: input.connectionStatus,
    hasCredentials: input.hasCredentials,
    lastHealthCheckOk: lastHealthStatus === "OK",
  });

  let score = 50;

  if (input.connectionStatus === "CONNECTED") score += 15;
  else if (input.connectionStatus === "NEEDS_AUTH") score -= 20;
  else if (input.connectionStatus === "ERROR") score -= 35;
  else if (input.connectionStatus === "DISABLED") score -= 25;

  if (input.hasCredentials) score += 10;
  else score -= 15;

  switch (lastHealthStatus) {
    case "OK":
      score += 20;
      break;
    case "DEGRADED":
      score -= 10;
      break;
    case "ERROR":
      score -= 25;
      break;
    default:
      score -= 5;
      break;
  }

  if (latencyMs != null) {
    if (latencyMs <= 500) score += 5;
    else if (latencyMs > INTEGRATION_HEALTH_LATENCY_WARN_MS) score -= 10;
  }

  if (syncFreshnessHours != null) {
    if (syncFreshnessHours <= 6) score += 10;
    else if (syncFreshnessHours > INTEGRATION_HEALTH_SYNC_STALE_HOURS) score -= 15;
    else if (syncFreshnessHours > 12) score -= 5;
  } else {
    score -= 5;
  }

  if (failRate > INTEGRATION_HEALTH_WEBHOOK_FAIL_RATE_WARN) score -= 20;
  else if (failRate > 0.05) score -= 8;

  if (presentation.truthLabel === "PLACEHOLDER") score -= 10;
  if (presentation.truthLabel === "ERROR") score -= 10;

  const historyScores = (input.healthCheckHistory ?? []).map((row) =>
    scoreIntegrationHealth({
      ...input,
      lastHealthStatus: row.status,
      latencyMs: row.latencyMs,
      healthCheckHistory: undefined,
      now: row.checkedAt,
    }).score,
  );

  const trend = computeIntegrationHealthTrend(historyScores);
  const base: IntegrationHealthScoreResult = {
    connectionId: input.connectionId,
    provider: input.provider,
    connectionName: input.connectionName,
    score: clampScore(score),
    band: bandFromScore(clampScore(score)),
    factors: {
      connectionStatus: input.connectionStatus,
      credentialsPresent: input.hasCredentials,
      lastHealthStatus,
      latencyMs,
      syncFreshnessHours,
      webhookFailRate7d: failRate,
      capabilityHeadline: presentation.headline,
    },
    trend,
    alerts: [],
  };

  base.alerts = predictIntegrationHealthAlerts(base, now);
  return base;
}

/** Trend from recent per-check scores (oldest → newest). */
export function computeIntegrationHealthTrend(recentScores: number[]): IntegrationHealthTrend {
  if (recentScores.length < 2) {
    return { direction: "insufficient_data", delta7d: 0, recentScores };
  }

  const midpoint = Math.floor(recentScores.length / 2);
  const older = recentScores.slice(0, midpoint);
  const newer = recentScores.slice(midpoint);
  const avg = (values: number[]) =>
    values.reduce((sum, v) => sum + v, 0) / Math.max(1, values.length);
  const delta7d = Math.round(avg(newer) - avg(older));

  let direction: IntegrationHealthTrend["direction"] = "stable";
  if (delta7d >= 8) direction = "improving";
  else if (delta7d <= -8) direction = "declining";

  return { direction, delta7d, recentScores };
}

/** Predictive alerts for a scored connection. */
export function predictIntegrationHealthAlerts(
  result: IntegrationHealthScoreResult,
): IntegrationHealthPredictiveAlert[] {
  const alerts: IntegrationHealthPredictiveAlert[] = [];
  const base = {
    connectionId: result.connectionId,
    provider: result.provider,
  };

  if (result.band === "critical") {
    alerts.push({
      ...base,
      id: `${result.connectionId}:score_critical`,
      severity: "critical",
      code: "score_critical",
      message: `${result.connectionName} health score ${result.score}/100 — immediate triage recommended.`,
    });
  }

  if (result.trend.direction === "declining") {
    alerts.push({
      ...base,
      id: `${result.connectionId}:score_declining`,
      severity: "warning",
      code: "score_declining",
      message: `${result.connectionName} score trending down (${result.trend.delta7d} pts) — investigate before channel outage.`,
    });
  }

  const syncHours = result.factors.syncFreshnessHours;
  if (syncHours != null && syncHours > INTEGRATION_HEALTH_SYNC_STALE_HOURS) {
    alerts.push({
      ...base,
      id: `${result.connectionId}:sync_stale`,
      severity: "warning",
      code: "sync_stale",
      message: `${result.connectionName} last sync ${Math.round(syncHours)}h ago — catalog/orders may drift.`,
    });
  }

  if (result.factors.webhookFailRate7d > INTEGRATION_HEALTH_WEBHOOK_FAIL_RATE_WARN) {
    alerts.push({
      ...base,
      id: `${result.connectionId}:webhook_failures`,
      severity: "critical",
      code: "webhook_failures",
      message: `${result.connectionName} webhook failure rate ${Math.round(result.factors.webhookFailRate7d * 100)}% (7d).`,
    });
  }

  if (
    result.factors.latencyMs != null &&
    result.factors.latencyMs > INTEGRATION_HEALTH_LATENCY_WARN_MS
  ) {
    alerts.push({
      ...base,
      id: `${result.connectionId}:latency_spike`,
      severity: "warning",
      code: "latency_spike",
      message: `${result.connectionName} health-check latency ${result.factors.latencyMs}ms exceeds ${INTEGRATION_HEALTH_LATENCY_WARN_MS}ms.`,
    });
  }

  if (
    result.factors.connectionStatus === "NEEDS_AUTH" ||
    (!result.factors.credentialsPresent && result.factors.connectionStatus !== "DISABLED")
  ) {
    alerts.push({
      ...base,
      id: `${result.connectionId}:auth_degraded`,
      severity: "warning",
      code: "auth_degraded",
      message: `${result.connectionName} credentials need attention before orders stop flowing.`,
    });
  }

  return alerts;
}

export function buildIntegrationHealthScoreboard(params: {
  connections: IntegrationHealthScoreResult[];
  now?: Date;
}): IntegrationHealthScoreboard {
  const scores = params.connections.map((c) => c.score);
  const workspaceScore =
    scores.length > 0
      ? clampScore(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;

  const alerts = params.connections.flatMap((c) => c.alerts);

  return {
    policyId: INTEGRATION_HEALTH_SCORING_POLICY_ID,
    generatedAtIso: (params.now ?? new Date()).toISOString(),
    workspaceScore,
    band: bandFromScore(workspaceScore),
    connections: params.connections,
    alerts,
    notes: [
      "Scores combine connection status, health checks, sync freshness, and webhook reliability.",
      "Predictive alerts flag declining trends before hard outages — not a production SLA guarantee.",
    ],
  };
}

function hasCredentials(conn: {
  accessTokenEncrypted: string | null;
  consumerKeyEncrypted: string | null;
  consumerSecretEncrypted: string | null;
}): boolean {
  return Boolean(
    conn.accessTokenEncrypted?.trim() ||
      (conn.consumerKeyEncrypted?.trim() && conn.consumerSecretEncrypted?.trim()),
  );
}

/** Load scoreboard for all workspace integration connections. */
export async function loadIntegrationHealthScoreboard(
  userId: string,
): Promise<IntegrationHealthScoreboard> {
  const now = new Date();
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);

  const connections = await prisma.integrationConnection.findMany({
    where: connectionWhere,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      provider: true,
      status: true,
      lastSyncAt: true,
      accessTokenEncrypted: true,
      consumerKeyEncrypted: true,
      consumerSecretEncrypted: true,
      healthChecks: {
        orderBy: { checkedAt: "desc" },
        take: 14,
        select: { status: true, latencyMs: true, checkedAt: true },
      },
    },
  });

  const connectionIds = connections.map((c) => c.id);
  const webhookGroups =
    connectionIds.length > 0
      ? await prisma.webhookEvent.groupBy({
          by: ["connectionId"],
          where: {
            userId,
            connectionId: { in: connectionIds },
            receivedAt: { gte: since7d },
          },
          _count: { _all: true },
        })
      : [];

  const webhookFailedGroups =
    connectionIds.length > 0
      ? await prisma.webhookEvent.groupBy({
          by: ["connectionId"],
          where: {
            userId,
            connectionId: { in: connectionIds },
            receivedAt: { gte: since7d },
            OR: [{ processed: false }, { signatureValid: false }],
          },
          _count: { _all: true },
        })
      : [];

  const webhookTotalByConn = new Map(
    webhookGroups.map((g) => [g.connectionId ?? "", g._count._all]),
  );
  const webhookFailedByConn = new Map(
    webhookFailedGroups.map((g) => [g.connectionId ?? "", g._count._all]),
  );

  const scored = connections.map((conn) => {
    const checks = [...conn.healthChecks].reverse();
    const last = conn.healthChecks[0];
    const total = webhookTotalByConn.get(conn.id) ?? 0;
    const failed = webhookFailedByConn.get(conn.id) ?? 0;

    return scoreIntegrationHealth({
      connectionId: conn.id,
      provider: String(conn.provider),
      connectionName: conn.name,
      connectionStatus: conn.status,
      hasCredentials: hasCredentials(conn),
      lastHealthStatus: (last?.status ?? "UNKNOWN") as IntegrationHealthStatusValue,
      latencyMs: last?.latencyMs ?? null,
      lastSyncAt: conn.lastSyncAt,
      webhookEvents7d: { total, failed },
      healthCheckHistory: checks.map((c) => ({
        status: c.status as IntegrationHealthStatusValue,
        latencyMs: c.latencyMs,
        checkedAt: c.checkedAt,
      })),
      now,
    });
  });

  return buildIntegrationHealthScoreboard({ connections: scored, now });
}
