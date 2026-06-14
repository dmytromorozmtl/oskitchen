import { buildAuditComplianceDashboard } from "@/lib/enterprise/audit-compliance-builders";
import {
  AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN,
  AUDIT_COMPLIANCE_RECENT_CRITICAL_TAKE,
} from "@/lib/enterprise/audit-compliance-policy";
import type { AuditCriticalEvent } from "@/lib/enterprise/audit-compliance-types";
import { DEFAULT_AUDIT_RETENTION_DAYS } from "@/lib/audit/audit-retention";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadAuditRetentionPolicy } from "@/services/audit/audit-retention-service";
import {
  buildAuditWhere,
  getAuditKpis,
  type AuditWorkspaceScope,
} from "@/services/audit/audit-query-service";

export type { AuditComplianceDashboard } from "@/lib/enterprise/audit-compliance-types";

function workspaceScope(ownerUserId: string, workspaceId: string): AuditWorkspaceScope {
  return {
    userId: ownerUserId,
    email: null,
    role: null,
    ownedWorkspaceIds: [workspaceId],
    platformBypass: false,
  };
}

export async function loadEnterpriseAuditComplianceDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const scope = workspaceScope(ownerUserId, workspaceId);
  const baseWhere = buildAuditWhere(scope, {});
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [kpis, retentionRow, eventsLast30Days, redactedEvents, exportsCompleted, categoryGroups, criticalRows] =
    await Promise.all([
      getAuditKpis(scope),
      loadAuditRetentionPolicy(workspaceId),
      prisma.auditLog.count({
        where: { AND: [baseWhere, { createdAt: { gte: thirtyDaysAgo } }] },
      }),
      prisma.auditLog.count({
        where: { AND: [baseWhere, { redactionApplied: true }] },
      }),
      prisma.auditExport.count({
        where: { workspaceId, status: "COMPLETE" },
      }),
      prisma.auditLog.groupBy({
        by: ["category"],
        where: {
          AND: [
            baseWhere,
            { category: { in: [...AUDIT_COMPLIANCE_CATEGORY_BREAKDOWN] } },
            { createdAt: { gte: thirtyDaysAgo } },
          ],
        },
        _count: { _all: true },
      }),
      prisma.auditLog.findMany({
        where: {
          AND: [
            baseWhere,
            { severity: { in: ["WARNING", "CRITICAL"] } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: AUDIT_COMPLIANCE_RECENT_CRITICAL_TAKE,
        select: {
          id: true,
          createdAt: true,
          action: true,
          severity: true,
          category: true,
          actorEmail: true,
        },
      }),
    ]);

  const categoryCounts = Object.fromEntries(
    categoryGroups.map((row) => [row.category ?? "UNKNOWN", row._count._all]),
  ) as Record<string, number>;

  const recentCritical: AuditCriticalEvent[] = criticalRows.map((row) => ({
    id: row.id,
    createdAtIso: row.createdAt.toISOString(),
    action: row.action,
    severity: row.severity ?? "UNKNOWN",
    category: row.category,
    actorEmail: row.actorEmail,
  }));

  return buildAuditComplianceDashboard({
    workspaceId,
    retentionDays: retentionRow?.retentionDays ?? DEFAULT_AUDIT_RETENTION_DAYS,
    retentionConfigured: Boolean(retentionRow),
    kpis,
    eventsLast30Days,
    redactedEvents,
    exportsCompleted,
    categoryCounts,
    recentCritical,
  });
}
