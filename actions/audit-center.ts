"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import type { AuditExportFormat } from "@prisma/client";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { canViewSensitiveAuditDetailFromGrants } from "@/lib/audit/audit-permissions";
import {
  requireAuditExportAccess,
  requireAuditRetentionMutationAccess,
} from "@/lib/audit/require-audit-center-mutation-access";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { clampRetentionDays } from "@/lib/audit/audit-retention";
import { resolveAuditWorkspaceScope } from "@/lib/audit/audit-center-scope";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import type { AuditListFilters } from "@/lib/audit/audit-types";
import { prisma } from "@/lib/prisma";
import { exportAuditLogsSync } from "@/services/audit/audit-export-service";
import { auditLog } from "@/services/audit/audit-service";
import {
  getAuditKpis,
  getAuditLogById,
  getAuditTimeline,
  queryAuditLogs,
  stripSensitiveDetailForViewer,
  type AuditWorkspaceScope,
} from "@/services/audit/audit-query-service";

async function resolveScope(): Promise<AuditWorkspaceScope | null> {
  return resolveAuditWorkspaceScope();
}

export type AuditCenterFlags = {
  canExport: boolean;
  canManageRetention: boolean;
  canSensitiveDetail: boolean;
};

export async function loadAuditCenterPageData(
  filters: AuditListFilters,
  cursor?: string | null,
): Promise<
  | { ok: false; error: "forbidden" | "no_workspace" }
  | {
      ok: true;
      scope: AuditWorkspaceScope;
      kpis: Awaited<ReturnType<typeof getAuditKpis>>;
      rows: Awaited<ReturnType<typeof queryAuditLogs>>["rows"];
      nextCursor: string | null;
      primaryWorkspaceId: string | null;
      exportHistory: {
        id: string;
        format: AuditExportFormat;
        status: string;
        rowCount: number;
        createdAt: string;
        completedAt: string | null;
      }[];
      flags: AuditCenterFlags;
    }
> {
  const scope = await resolveScope();
  if (!scope) return { ok: false, error: "forbidden" };
  const primaryWorkspaceId = scope.ownedWorkspaceIds[0] ?? null;
  if (!primaryWorkspaceId) return { ok: false, error: "no_workspace" };

  const [kpis, page, exportHistory] = await Promise.all([
    getAuditKpis(scope),
    queryAuditLogs(scope, filters, cursor ?? undefined),
    prisma.auditExport.findMany({
      where: { workspaceId: primaryWorkspaceId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, format: true, status: true, rowCount: true, createdAt: true, completedAt: true },
    }),
  ]);

  const actor = await requireWorkspacePermissionActor();
  const viewSensitive = canViewSensitiveAuditDetailFromGrants(actor.granted, actor.platformBypass);
  const flags: AuditCenterFlags = {
    canExport: hasPermission(actor.granted, "audit.export"),
    canManageRetention: hasPermission(actor.granted, "workspace.settings"),
    canSensitiveDetail: viewSensitive,
  };

  return {
    ok: true,
    scope,
    kpis,
    rows: page.rows,
    nextCursor: page.nextCursor,
    primaryWorkspaceId,
    exportHistory: exportHistory.map((r) => ({
      id: r.id,
      format: r.format,
      status: r.status,
      rowCount: r.rowCount,
      createdAt: r.createdAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
    })),
    flags,
  };
}

export async function loadMoreAuditLogsAction(
  filters: AuditListFilters,
  cursor: string,
): Promise<{ ok: false; error: string } | { ok: true; rows: Awaited<ReturnType<typeof queryAuditLogs>>["rows"]; nextCursor: string | null }> {
  const scope = await resolveScope();
  if (!scope) return { ok: false, error: "forbidden" };
  const page = await queryAuditLogs(scope, filters, cursor);
  return { ok: true, rows: page.rows, nextCursor: page.nextCursor };
}

export async function getAuditLogDetailAction(
  id: string,
): Promise<{ ok: false; error: string } | { ok: true; row: Record<string, unknown>; related: Record<string, unknown>[] }> {
  const scope = await resolveScope();
  if (!scope) return { ok: false, error: "forbidden" };
  const actor = await requireWorkspacePermissionActor();
  const viewSensitive = canViewSensitiveAuditDetailFromGrants(actor.granted, actor.platformBypass);
  const row = await getAuditLogById(scope, id);
  if (!row) return { ok: false, error: "not_found" };
  const safe = stripSensitiveDetailForViewer(row, viewSensitive);
  if (!safe) return { ok: false, error: "not_found" };
  const serialized = JSON.parse(JSON.stringify(safe)) as Record<string, unknown>;
  let related: Record<string, unknown>[] = [];
  if (safe.entityType && safe.entityId) {
    const rel = await getAuditTimeline(scope, safe.entityType, safe.entityId, 20);
    related = rel.map((r) => JSON.parse(JSON.stringify(stripSensitiveDetailForViewer(r, viewSensitive) ?? r)) as Record<string, unknown>);
  }
  return { ok: true, row: serialized, related };
}

export async function runAuditExportAction(input: {
  format: AuditExportFormat;
  filters: AuditListFilters;
}): Promise<{ ok: false; error: string } | { ok: true; body: string; filename: string; rowCount: number }> {
  const exportAccess = await requireAuditExportAccess();
  if (!exportAccess.ok) return { ok: false, error: "forbidden" };
  const scope = await resolveScope();
  if (!scope) return { ok: false, error: "forbidden" };
  const wsId = input.filters.workspaceId && scope.ownedWorkspaceIds.includes(input.filters.workspaceId)
    ? input.filters.workspaceId
    : scope.ownedWorkspaceIds[0];
  if (!wsId) return { ok: false, error: "no_workspace" };
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const out = await exportAuditLogsSync({
    scope,
    workspaceId: wsId,
    filters: input.filters,
    format: input.format,
    requestedById: user.id,
  });
  if (!out.ok) return { ok: false, error: out.error };
  return { ok: true, body: out.body, filename: out.filename, rowCount: out.rowCount };
}

export async function upsertAuditRetentionAction(formData: FormData): Promise<void> {
  const retentionAccess = await requireAuditRetentionMutationAccess();
  if (!retentionAccess.ok) throw new Error("forbidden");
  const scope = await resolveScope();
  if (!scope) throw new Error("forbidden");
  const wsId = scope.ownedWorkspaceIds[0];
  if (!wsId) throw new Error("no_workspace");

  const daysRaw = Number(formData.get("retentionDays") ?? 365);
  const retentionDays = clampRetentionDays(daysRaw);
  const exportBeforeDelete = formData.has("exportBeforeDelete");
  const archiveBeforeDelete = formData.has("archiveBeforeDelete");
  const legalHoldNote = (formData.get("legalHoldNote") as string | null)?.trim().slice(0, 500) || null;

  await prisma.auditRetentionPolicy.upsert({
    where: { workspaceId: wsId },
    create: {
      workspaceId: wsId,
      retentionDays,
      exportBeforeDelete,
      archiveBeforeDelete,
      legalHoldNote,
      active: true,
    },
    update: { retentionDays, exportBeforeDelete, archiveBeforeDelete, legalHoldNote, active: true },
  });

  void auditLog({
    workspaceId: wsId,
    actor: { userId: scope.userId },
    action: AUDIT_ACTIONS.AUDIT_RETENTION_UPDATED,
    category: "SETTINGS",
    source: "USER",
    severity: "NOTICE",
    entity: { type: "AuditRetentionPolicy", id: wsId },
    metadata: { retentionDays, exportBeforeDelete, archiveBeforeDelete, hasLegalHoldNote: Boolean(legalHoldNote) },
  });

  revalidatePath("/dashboard/audit-logs");
  revalidatePath("/dashboard/audit-logs/retention");
}

export async function getAuditRetentionForOwnerAction(): Promise<
  { ok: false; error: string } | { ok: true; policy: { retentionDays: number; exportBeforeDelete: boolean; archiveBeforeDelete: boolean; legalHoldNote: string | null } | null }
> {
  const retentionAccess = await requireAuditRetentionMutationAccess();
  if (!retentionAccess.ok) return { ok: false, error: "forbidden" };
  const scope = await resolveScope();
  if (!scope) return { ok: false, error: "forbidden" };
  const wsId = scope.ownedWorkspaceIds[0];
  if (!wsId) return { ok: false, error: "no_workspace" };
  const row = await prisma.auditRetentionPolicy.findUnique({ where: { workspaceId: wsId } });
  if (!row) {
    return {
      ok: true,
      policy: {
        retentionDays: 365,
        exportBeforeDelete: true,
        archiveBeforeDelete: false,
        legalHoldNote: null,
      },
    };
  }
  return {
    ok: true,
    policy: {
      retentionDays: row.retentionDays,
      exportBeforeDelete: row.exportBeforeDelete,
      archiveBeforeDelete: row.archiveBeforeDelete,
      legalHoldNote: row.legalHoldNote,
    },
  };
}
