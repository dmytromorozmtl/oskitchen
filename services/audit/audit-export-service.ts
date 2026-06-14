import type { AuditExportFormat, Prisma } from "@prisma/client";

import { csvEscapeCell } from "@/lib/audit/audit-formatters";
import type { AuditListFilters } from "@/lib/audit/audit-types";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { buildAuditWhere, type AuditWorkspaceScope } from "@/services/audit/audit-query-service";

export const EXPORT_CAP = 5000;

export type AuditExportRow = {
  id: string;
  createdAt: Date;
  action: string;
  category: string | null;
  severity: string | null;
  source: string | null;
  entityType: string;
  entityId: string | null;
  actorEmail: string | null;
  userId: string | null;
  route: string | null;
};

export type ExportAuditParams = {
  scope: AuditWorkspaceScope;
  /** Target workspace for export job row + audit trail (must be in scope.ownedWorkspaceIds). */
  workspaceId: string;
  filters: AuditListFilters;
  format: AuditExportFormat;
  requestedById: string;
};

export function buildAuditExportCsv(rows: AuditExportRow[]): string {
  const headers = [
    "id",
    "createdAt",
    "severity",
    "action",
    "category",
    "source",
    "entityType",
    "entityId",
    "actorEmail",
    "userId",
    "route",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscapeCell(r.id),
        csvEscapeCell(r.createdAt.toISOString()),
        csvEscapeCell(r.severity ?? ""),
        csvEscapeCell(r.action),
        csvEscapeCell(r.category ?? ""),
        csvEscapeCell(r.source ?? ""),
        csvEscapeCell(r.entityType),
        csvEscapeCell(r.entityId ?? ""),
        csvEscapeCell(r.actorEmail ?? ""),
        csvEscapeCell(r.userId ?? ""),
        csvEscapeCell(r.route ?? ""),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function buildAuditExportJson(rows: AuditExportRow[]): string {
  return JSON.stringify(rows, null, 2);
}

export async function exportAuditLogsSync(
  params: ExportAuditParams,
): Promise<{ ok: true; body: string; filename: string; rowCount: number } | { ok: false; error: string }> {
  const wsId = params.workspaceId;
  if (!params.scope.ownedWorkspaceIds.includes(wsId)) return { ok: false, error: "no_workspace" };

  const where = buildAuditWhere(params.scope, params.filters);
  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: EXPORT_CAP,
    select: {
      id: true,
      createdAt: true,
      action: true,
      category: true,
      severity: true,
      source: true,
      entityType: true,
      entityId: true,
      actorEmail: true,
      userId: true,
      route: true,
    },
  });

  const body =
    params.format === "CSV" ? buildAuditExportCsv(rows) : buildAuditExportJson(rows);
  const ext = params.format === "CSV" ? "csv" : "json";
  const filename = `audit-export-${new Date().toISOString().slice(0, 10)}.${ext}`;

  await prisma.auditExport.create({
    data: {
      workspaceId: wsId,
      requestedById: params.requestedById,
      filtersJson: params.filters as unknown as Prisma.InputJsonValue,
      format: params.format,
      status: "COMPLETE",
      rowCount: rows.length,
      completedAt: new Date(),
    },
  });

  await auditLog({
    workspaceId: wsId,
    actor: { userId: params.requestedById },
    action: "AUDIT_EXPORT_GENERATED",
    category: "IMPORT_EXPORT",
    source: "USER",
    severity: "NOTICE",
    entity: { type: "AuditExport", label: params.format },
    metadata: { rowCount: rows.length, format: params.format },
  });

  return { ok: true, body, filename, rowCount: rows.length };
}
