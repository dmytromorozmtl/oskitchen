/**
 * Integration recovery playbooks — auto-recovery steps, manual runbooks, success tracking.
 *
 * Maps health-scoring alerts to operator playbooks and records auto-step outcomes.
 *
 * @see lib/integration-health/recovery-playbook-policy.ts
 * @see services/integration-health/health-scoring-engine.ts
 */

import type { Prisma } from "@prisma/client";
import { IntegrationHealthStatus, IntegrationProvider } from "@prisma/client";

import {
  computeRecoverySuccessRate,
  getRecoveryPlaybookForAlert,
  RECOVERY_EXECUTION_HISTORY_LIMIT,
  type RecoveryAutoAction,
  type RecoveryPlaybook,
  type StoredRecoveryExecution,
} from "@/lib/integration-health/recovery-playbook-policy";
import {
  getShopifyCredentials,
  getWooCommerceCredentials,
} from "@/lib/integrations/decrypt-connection";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByIdWhereForOwner, integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { runCrossChannelInventorySyncPull } from "@/services/inventory/cross-channel-inventory-sync";
import { runInventorySyncPull } from "@/services/integrations/inventory-sync-load";
import { testConnection as testShopify } from "@/services/integrations/shopify";
import { testConnection as testWoo } from "@/services/integrations/woocommerce";

import {
  loadIntegrationHealthScoreboard,
  type IntegrationHealthPredictiveAlert,
  type IntegrationHealthScoreboard,
} from "./health-scoring-engine";

export type RecoveryPlaybookAssignment = {
  alert: IntegrationHealthPredictiveAlert;
  playbook: RecoveryPlaybook;
};

export type RecoverySuccessRateSummary = {
  connectionId: string;
  provider: string;
  connectionName: string;
  attempts: number;
  successes: number;
  successRate: number;
};

export type IntegrationRecoveryPlan = {
  scoreboard: IntegrationHealthScoreboard;
  assignments: RecoveryPlaybookAssignment[];
  executions: StoredRecoveryExecution[];
  successRates: RecoverySuccessRateSummary[];
  notes: string[];
};

function parseExecutions(settingsJson: unknown): StoredRecoveryExecution[] {
  if (!settingsJson || typeof settingsJson !== "object") return [];
  const recovery = (settingsJson as Record<string, unknown>).integrationRecovery;
  if (!recovery || typeof recovery !== "object") return [];
  const raw = (recovery as Record<string, unknown>).executions;
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is StoredRecoveryExecution => {
    return row != null && typeof row === "object" && typeof (row as StoredRecoveryExecution).id === "string";
  });
}

function mergeExecutions(
  settingsJson: unknown,
  executions: StoredRecoveryExecution[],
): Record<string, unknown> {
  const base =
    settingsJson && typeof settingsJson === "object"
      ? { ...(settingsJson as Record<string, unknown>) }
      : {};
  const prev =
    base.integrationRecovery && typeof base.integrationRecovery === "object"
      ? { ...(base.integrationRecovery as Record<string, unknown>) }
      : {};
  base.integrationRecovery = {
    ...prev,
    executions: executions.slice(-RECOVERY_EXECUTION_HISTORY_LIMIT),
  };
  return base;
}

async function persistExecution(
  connectionId: string,
  executions: StoredRecoveryExecution[],
): Promise<void> {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;
  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      settingsJson: mergeExecutions(conn.settingsJson, executions) as Prisma.InputJsonValue,
    },
  });
}

async function runHealthCheckForConnection(
  userId: string,
  connectionId: string,
): Promise<{ ok: boolean; message: string; status: IntegrationHealthStatus }> {
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(userId, connectionId),
  });
  if (!conn) return { ok: false, message: "Connection not found", status: "ERROR" };

  const started = Date.now();
  let status: IntegrationHealthStatus = "OK";
  let errorMessage: string | null = null;

  if (conn.status === "ERROR") {
    status = "ERROR";
    errorMessage = conn.lastError?.slice(0, 500) ?? "Connection in error state";
  } else if (conn.status === "NEEDS_AUTH") {
    status = "DEGRADED";
    errorMessage = "Credentials need attention";
  } else if (conn.provider === IntegrationProvider.WOOCOMMERCE) {
    const creds = getWooCommerceCredentials(conn);
    if (!creds) {
      status = "DEGRADED";
      errorMessage = "Incomplete WooCommerce credentials";
    } else {
      const live = await testWoo(creds);
      if (!live.ok) {
        status = "ERROR";
        errorMessage = live.message;
      }
    }
  } else if (conn.provider === IntegrationProvider.SHOPIFY) {
    const creds = getShopifyCredentials(conn);
    if (!creds) {
      status = "DEGRADED";
      errorMessage = "Incomplete Shopify credentials";
    } else {
      const live = await testShopify(creds);
      if (!live.ok) {
        status = "ERROR";
        errorMessage = live.message;
      }
    }
  }

  const latencyMs = Math.min(60_000, Math.max(0, Date.now() - started));

  await prisma.integrationHealthCheck.create({
    data: {
      connectionId: conn.id,
      status,
      latencyMs,
      errorMessage,
    },
  });

  if (status === "OK") {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: { lastError: null },
    });
  }

  return {
    ok: status === "OK",
    message: errorMessage ?? `Health check ${status} (${latencyMs}ms)`,
    status,
  };
}

export function assignRecoveryPlaybooks(
  alerts: IntegrationHealthPredictiveAlert[],
): RecoveryPlaybookAssignment[] {
  const assignments: RecoveryPlaybookAssignment[] = [];
  for (const alert of alerts) {
    const playbook = getRecoveryPlaybookForAlert(alert.code);
    if (!playbook) continue;
    assignments.push({ alert, playbook });
  }
  return assignments;
}

export async function executeRecoveryAutoStep(params: {
  userId: string;
  connectionId: string;
  alertCode: IntegrationHealthPredictiveAlert["code"];
  stepId: string;
  autoAction: RecoveryAutoAction;
}): Promise<{ ok: boolean; message: string; execution: StoredRecoveryExecution }> {
  let ok = false;
  let message = "Auto-recovery step completed";

  try {
    switch (params.autoAction) {
      case "run_health_check": {
        const result = await runHealthCheckForConnection(params.userId, params.connectionId);
        ok = result.ok;
        message = result.message;
        break;
      }
      case "pull_inventory_sync":
        await runInventorySyncPull(params.userId);
        ok = true;
        message = "Inventory sync pull completed";
        break;
      case "pull_cross_channel_sync":
        await runCrossChannelInventorySyncPull(params.userId);
        ok = true;
        message = "Cross-channel inventory pull completed";
        break;
      default:
        message = "Unknown auto-recovery action";
        break;
    }
  } catch (error) {
    ok = false;
    message = error instanceof Error ? error.message : String(error);
  }

  const execution: StoredRecoveryExecution = {
    id: `recovery:${params.connectionId}:${params.stepId}:${Date.now()}`,
    connectionId: params.connectionId,
    alertCode: params.alertCode,
    stepId: params.stepId,
    autoAction: params.autoAction,
    status: ok ? "success" : "failed",
    message,
    executedAt: new Date().toISOString(),
  };

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: params.connectionId },
    select: { settingsJson: true },
  });
  const prior = parseExecutions(conn?.settingsJson);
  await persistExecution(params.connectionId, [...prior, execution]);

  return { ok, message, execution };
}

export async function runAutoRecoveryForAlert(params: {
  userId: string;
  connectionId: string;
  alertCode: IntegrationHealthPredictiveAlert["code"];
}): Promise<{
  attempted: number;
  succeeded: number;
  results: Array<{ stepId: string; ok: boolean; message: string }>;
}> {
  const playbook = getRecoveryPlaybookForAlert(params.alertCode);
  if (!playbook) {
    return { attempted: 0, succeeded: 0, results: [] };
  }

  const autoSteps = playbook.steps.filter(
    (s): s is typeof s & { autoAction: RecoveryAutoAction } =>
      s.kind === "auto" && Boolean(s.autoAction),
  );

  const results: Array<{ stepId: string; ok: boolean; message: string }> = [];
  let succeeded = 0;

  for (const step of autoSteps) {
    const outcome = await executeRecoveryAutoStep({
      userId: params.userId,
      connectionId: params.connectionId,
      alertCode: params.alertCode,
      stepId: step.id,
      autoAction: step.autoAction,
    });
    results.push({ stepId: step.id, ok: outcome.ok, message: outcome.message });
    if (outcome.ok) succeeded += 1;
  }

  return { attempted: autoSteps.length, succeeded, results };
}

export async function loadIntegrationRecoveryExecutions(
  userId: string,
): Promise<StoredRecoveryExecution[]> {
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);
  const connections = await prisma.integrationConnection.findMany({
    where: connectionWhere,
    select: { settingsJson: true },
  });
  return connections.flatMap((c) => parseExecutions(c.settingsJson));
}

export async function loadIntegrationRecoveryPlan(
  userId: string,
): Promise<IntegrationRecoveryPlan> {
  const [scoreboard, executions] = await Promise.all([
    loadIntegrationHealthScoreboard(userId),
    loadIntegrationRecoveryExecutions(userId),
  ]);

  const assignments = assignRecoveryPlaybooks(scoreboard.alerts);

  const successRates = scoreboard.connections.map((conn) => {
    const stats = computeRecoverySuccessRate(executions, { connectionId: conn.connectionId });
    return {
      connectionId: conn.connectionId,
      provider: conn.provider,
      connectionName: conn.connectionName,
      attempts: stats.attempts,
      successes: stats.successes,
      successRate: stats.successRate,
    };
  });

  return {
    scoreboard,
    assignments,
    executions,
    successRates,
    notes: [
      "Auto-recovery runs safe health checks and sync pulls — never rotates secrets automatically.",
      "Manual steps link to existing operator surfaces (webhooks, sales channels, error recovery).",
      "Success rate tracks auto-step outcomes stored per connection settings.",
    ],
  };
}

export { computeRecoverySuccessRate, getRecoveryPlaybookForAlert };
