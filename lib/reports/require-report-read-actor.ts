import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canDoReports } from "@/lib/reports/report-permissions";
import type { ReportPermission } from "@/lib/reports/report-types";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";
import { logReportPermissionDenied } from "@/services/reports/report-permission-audit";

const DENIED_MESSAGES: Partial<Record<ReportPermission, string>> = {
  "reports.read.operations": "You do not have permission to view operational reports.",
  "reports.read.financial": "You do not have permission to view financial reports.",
  "reports.read.customer_pii": "You do not have permission to view customer PII reports.",
  "reports.read.audit": "You do not have permission to view audit reports.",
  "reports.saved.manage": "You do not have permission to manage saved reports.",
};

export async function requireReportReadActor(
  requiredPermission: ReportPermission,
  input?: {
    operation?: string;
    reportKey?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<
  | {
      ok: true;
      actor: WorkspacePermissionActor;
      scope: ReturnType<typeof createReportActorScope>;
    }
  | { ok: false; error: string }
> {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = createReportActorScope(actor);
    if (canDoReports(scope, requiredPermission)) {
      return { ok: true, actor, scope };
    }
    await logReportPermissionDenied(actor, {
      requiredPermission,
      operation: input?.operation ?? requiredPermission,
      reportKey: input?.reportKey,
      metadata: input?.metadata,
    });
    return {
      ok: false,
      error:
        DENIED_MESSAGES[requiredPermission] ??
        "You do not have permission to view this report.",
    };
  } catch {
    return {
      ok: false,
      error:
        DENIED_MESSAGES[requiredPermission] ??
        "You do not have permission to view this report.",
    };
  }
}
