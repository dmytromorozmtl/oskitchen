import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AuditListFilters } from "@/lib/audit/audit-types";
import { canViewSensitiveAuditDetail } from "@/lib/audit/audit-permissions";
import { isSuperAdminEmail } from "@/lib/platform-owner";

const PAGE_SIZE = 50;

export type AuditWorkspaceScope = {
  userId: string;
  email: string | null;
  role: string | null;
  ownedWorkspaceIds: string[];
};

export function buildAuditWhere(
  scope: AuditWorkspaceScope,
  filters: AuditListFilters,
): Prisma.AuditLogWhereInput {
  const wsIds = scope.ownedWorkspaceIds;
  const baseScope: Prisma.AuditLogWhereInput =
    wsIds.length > 0
      ? {
          OR: [{ workspaceId: { in: wsIds } }, { AND: [{ userId: scope.userId }, { workspaceId: null }] }],
        }
      : { userId: scope.userId };

  const and: Prisma.AuditLogWhereInput[] = [baseScope];

  if (filters.workspaceId && wsIds.includes(filters.workspaceId)) {
    and.push({ workspaceId: filters.workspaceId });
  }
  if (filters.from || filters.to) {
    and.push({
      createdAt: {
        ...(filters.from ? { gte: filters.from } : {}),
        ...(filters.to ? { lte: filters.to } : {}),
      },
    });
  }
  if (filters.action?.trim()) {
    and.push({ action: { contains: filters.action.trim(), mode: "insensitive" } });
  }
  if (filters.category?.trim()) {
    and.push({ category: filters.category.trim() });
  }
  if (filters.source) {
    and.push({ source: filters.source });
  }
  if (filters.severity) {
    and.push({ severity: filters.severity });
  }
  if (filters.actorUserId?.trim()) {
    and.push({ userId: filters.actorUserId.trim() });
  }
  if (filters.actorEmail?.trim()) {
    and.push({ actorEmail: { contains: filters.actorEmail.trim(), mode: "insensitive" } });
  }
  if (filters.entityType?.trim()) {
    and.push({ entityType: { contains: filters.entityType.trim(), mode: "insensitive" } });
  }
  if (filters.entityId?.trim()) {
    and.push({ entityId: filters.entityId.trim() });
  }
  if (filters.requestId?.trim()) {
    and.push({ requestId: filters.requestId.trim() });
  }
  if (filters.route?.trim()) {
    and.push({ route: { contains: filters.route.trim(), mode: "insensitive" } });
  }
  if (filters.redactionApplied === true) {
    and.push({ redactionApplied: true });
  }
  if (filters.onlyCritical) {
    and.push({ severity: { in: ["WARNING", "CRITICAL"] } });
  }
  if (filters.onlyFailed) {
    and.push({
      OR: [
        { action: { contains: "FAILED", mode: "insensitive" } },
        { action: { contains: "_FAIL", mode: "insensitive" } },
        { severity: "CRITICAL" },
      ],
    });
  }
  if (filters.keyword?.trim()) {
    const q = filters.keyword.trim();
    and.push({
      OR: [
        { action: { contains: q, mode: "insensitive" } },
        { entityType: { contains: q, mode: "insensitive" } },
        { entityLabel: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const rawTab = filters.tab ?? "all";
  const tab = rawTab === "activity" ? "all" : rawTab;
  if (tab === "security") {
    and.push({
      OR: [
        { category: "SECURITY" },
        { category: "AUTH" },
        { category: "PERMISSIONS" },
        { severity: { in: ["WARNING", "CRITICAL"] } },
      ],
    });
  } else if (tab === "data") {
    and.push({
      OR: [
        { NOT: { beforeJson: { equals: Prisma.DbNull } } },
        { NOT: { afterJson: { equals: Prisma.DbNull } } },
        { NOT: { diffJson: { equals: Prisma.DbNull } } },
      ],
    });
  } else if (tab === "integrations") {
    and.push({ OR: [{ category: "SALES_CHANNELS" }, { category: "WEBHOOKS" }, { source: "WEBHOOK" }] });
  } else if (tab === "imports") {
    and.push({ OR: [{ category: "IMPORT_EXPORT" }, { source: "IMPORT" }] });
  } else if (tab === "billing") {
    and.push({ OR: [{ category: "BILLING" }, { source: "BILLING_PROVIDER" }] });
  } else if (tab === "ai") {
    and.push({
      OR: [{ category: "AI_COPILOT" }, { category: "AUTOMATIONS" }, { source: "AI_COPILOT" }, { source: "AUTOMATION" }],
    });
  } else if (tab === "exports") {
    and.push({
      OR: [
        { action: { contains: "AUDIT_EXPORT", mode: "insensitive" } },
        { action: { contains: "EXPORT_GENERATED", mode: "insensitive" } },
      ],
    });
  } else if (tab === "storefront") {
    and.push({ action: { startsWith: "storefront.", mode: "insensitive" } });
  }

  const viewerRole = (scope.role ?? "").toLowerCase();
  const isManager =
    viewerRole === "manager" || viewerRole === "kitchen_lead" || viewerRole === "customer_service";
  if (isManager && !isSuperAdminEmail(scope.email)) {
    and.push({
      OR: [{ category: null }, { category: { notIn: ["SECURITY", "DEVELOPER", "PERMISSIONS", "AUTH"] } }],
    });
  }

  return { AND: and };
}

const auditListSelect = {
  id: true,
  createdAt: true,
  action: true,
  category: true,
  severity: true,
  source: true,
  entityType: true,
  entityId: true,
  entityLabel: true,
  userId: true,
  actorEmail: true,
  actorRole: true,
  route: true,
  method: true,
  requestId: true,
  redactionApplied: true,
  workspaceId: true,
} as const;

export type AuditLogListRow = Prisma.AuditLogGetPayload<{ select: typeof auditListSelect }>;

export async function queryAuditLogs(
  scope: AuditWorkspaceScope,
  filters: AuditListFilters,
  cursor?: string | null,
): Promise<{ rows: AuditLogListRow[]; nextCursor: string | null }> {
  const where = buildAuditWhere(scope, filters);
  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: auditListSelect,
  });
  let nextCursor: string | null = null;
  if (rows.length > PAGE_SIZE) {
    const last = rows[PAGE_SIZE - 1];
    rows.splice(PAGE_SIZE);
    nextCursor = last?.id ?? null;
  }
  return { rows, nextCursor };
}

export async function getAuditLogById(scope: AuditWorkspaceScope, id: string) {
  const where = buildAuditWhere(scope, {});
  return prisma.auditLog.findFirst({ where: { AND: [where, { id }] } });
}

export async function getAuditTimeline(scope: AuditWorkspaceScope, entityType: string, entityId: string, take = 100) {
  const where = buildAuditWhere(scope, {});
  return prisma.auditLog.findMany({
    where: { AND: [where, { entityType, entityId }] },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export type AuditKpis = {
  eventsToday: number;
  warnings: number;
  critical: number;
  failedWebhooks: number;
  permissionChanges: number;
  importsCommitted: number;
  billingEvents: number;
  suspicious: number;
};

export async function getAuditKpis(scope: AuditWorkspaceScope): Promise<AuditKpis> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const base = buildAuditWhere(scope, {});

  const [
    eventsToday,
    warnings,
    critical,
    failedWebhooks,
    permissionChanges,
    importsCommitted,
    billingEvents,
    suspicious,
  ] = await Promise.all([
    prisma.auditLog.count({ where: { AND: [base, { createdAt: { gte: start } }] } }),
    prisma.auditLog.count({ where: { AND: [base, { severity: "WARNING" }] } }),
    prisma.auditLog.count({ where: { AND: [base, { severity: "CRITICAL" }] } }),
    prisma.auditLog.count({
      where: {
        AND: [
          base,
          {
            OR: [
              { action: { contains: "WEBHOOK_FAILED", mode: "insensitive" } },
              { action: { contains: "webhook_failed", mode: "insensitive" } },
            ],
          },
        ],
      },
    }),
    prisma.auditLog.count({
      where: {
        AND: [base, { OR: [{ category: "PERMISSIONS" }, { action: { contains: "ROLE", mode: "insensitive" } }] }],
      },
    }),
    prisma.auditLog.count({
      where: {
        AND: [
          base,
          {
            OR: [
              { action: { contains: "IMPORT_COMMITTED", mode: "insensitive" } },
              { action: { contains: "import", mode: "insensitive" } },
            ],
          },
        ],
      },
    }),
    prisma.auditLog.count({
      where: { AND: [base, { OR: [{ category: "BILLING" }, { source: "BILLING_PROVIDER" }] }] },
    }),
    prisma.auditLog.count({
      where: {
        AND: [
          base,
          {
            OR: [
              { action: { contains: "SECURITY_SUSPICIOUS", mode: "insensitive" } },
              { severity: "CRITICAL" },
            ],
          },
        ],
      },
    }),
  ]);

  return {
    eventsToday,
    warnings,
    critical,
    failedWebhooks,
    permissionChanges,
    importsCommitted,
    billingEvents,
    suspicious,
  };
}

export function stripSensitiveDetailForViewer<
  T extends { beforeJson?: unknown; afterJson?: unknown; diffJson?: unknown; metadataJson?: unknown },
>(row: T | null, email: string | null | undefined, role: string | null | undefined): T | null {
  if (!row) return null;
  if (canViewSensitiveAuditDetail(email, role)) return row;
  const { beforeJson: _b, afterJson: _a, diffJson: _d, ...rest } = row;
  return { ...rest, beforeJson: undefined, afterJson: undefined, diffJson: undefined, metadataJson: row.metadataJson } as T;
}
