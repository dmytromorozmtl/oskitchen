import { getReportDefinition } from "@/lib/reports/report-registry";
import { requireReportReadActor } from "@/lib/reports/require-report-read-actor";
import type { ReportKey, ReportPermission } from "@/lib/reports/report-types";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import type { createReportActorScope } from "@/lib/reports/report-actor-scope";

/** Server gate for `/dashboard/reports/[reportKey]` — audits denials before data load. */
export async function requireReportGeneratorPageAccess(reportKey: ReportKey): Promise<
  | {
      ok: true;
      actor: WorkspacePermissionActor;
      scope: ReturnType<typeof createReportActorScope>;
      definition: ReturnType<typeof getReportDefinition>;
    }
  | { ok: false; requiredPermission: ReportPermission }
> {
  const definition = getReportDefinition(reportKey);
  const access = await requireReportReadActor(definition.requiredPermission, {
    operation: "reports.generator.view",
    reportKey,
  });
  if (!access.ok) {
    return { ok: false, requiredPermission: definition.requiredPermission };
  }
  return { ok: true, actor: access.actor, scope: access.scope, definition };
}
