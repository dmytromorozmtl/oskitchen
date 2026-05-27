import { requireExportActor } from "@/lib/import-export/require-export-actor";
import { hasPermission } from "@/lib/permissions/guards";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export function canExportReports(actor: WorkspacePermissionActor): boolean {
  return hasPermission(actor.granted, "reports.export");
}

export async function requireReportExportActor(input?: {
  reportKey?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}):
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string } {
  const reportKey = input?.reportKey;
  return requireExportActor({
    exportType: "reports",
    operation: input?.operation ?? (reportKey ? `report:${reportKey}` : "report:export"),
    metadata: {
      ...(reportKey ? { reportKey } : {}),
      ...input?.metadata,
    },
  });
}
