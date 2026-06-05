import { buildSlaMonitoringDashboard } from "@/lib/enterprise/sla-monitoring-builders";
import { checkDatabaseHealth } from "@/lib/db/health";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { getAuditKpis, type AuditWorkspaceScope } from "@/services/audit/audit-query-service";
import { loadCriticalCronExecutionHealth } from "@/services/cron/cron-execution-evidence";
import { loadLiveIntegrationHealthDashboard } from "@/services/integrations/integration-health-live-service";

export type { SlaMonitoringDashboard } from "@/lib/enterprise/sla-monitoring-types";

function percentile95(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[index] ?? null;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function loadEnterpriseSlaMonitoringDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const scope: AuditWorkspaceScope = {
    userId: ownerUserId,
    email: null,
    role: null,
    ownedWorkspaceIds: [workspaceId],
    platformBypass: false,
  };

  const [dbHealth, integrationHealth, cronHealth, auditKpis, connectionIds] = await Promise.all([
    checkDatabaseHealth(),
    loadLiveIntegrationHealthDashboard(ownerUserId),
    loadCriticalCronExecutionHealth(),
    getAuditKpis(scope),
    prisma.integrationConnection.findMany({
      where: { userId: ownerUserId },
      select: { id: true },
    }),
  ]);

  const recentChecks =
    connectionIds.length > 0
      ? await prisma.integrationHealthCheck.findMany({
          where: {
            connectionId: { in: connectionIds.map((row) => row.id) },
            checkedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            latencyMs: { not: null },
          },
          orderBy: { checkedAt: "desc" },
          take: 100,
          select: { latencyMs: true },
        })
      : [];

  const latencies = recentChecks
    .map((row) => row.latencyMs)
    .filter((value): value is number => value != null);

  const cronTracked = cronHealth.tracked ?? [];
  const cronHealthy = cronTracked.filter((row) => row.status === "healthy").length;
  const cronFailing = cronTracked.filter(
    (row) => row.status === "failing" || row.status === "stale",
  ).length;

  return buildSlaMonitoringDashboard({
    workspaceId,
    databaseOk: dbHealth.ok,
    databaseLatencyMs: dbHealth.latencyMs,
    integrationFleetScore: integrationHealth.fleetScore,
    healthyIntegrations: integrationHealth.healthyCount,
    watchIntegrations: integrationHealth.watchCount,
    criticalIntegrations: integrationHealth.criticalCount,
    monitoredIntegrations: integrationHealth.monitoredCount,
    cronHealthy,
    cronTotal: cronTracked.length,
    cronFailing,
    failedWebhooks: auditKpis.failedWebhooks,
    integrationCheckLatencyMs: average(latencies),
    integrationCheckP95Ms: percentile95(latencies),
  });
}
