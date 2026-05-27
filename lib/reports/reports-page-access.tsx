import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canDoReports } from "@/lib/reports/report-permissions";
import type { ReportPermission } from "@/lib/reports/report-types";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

function deniedCard(title: string, description: string): ReactNode {
  return createElement(PosAccessCard, {
    title,
    description,
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export function reportsOperationsDeniedCard(): ReactNode {
  return deniedCard(
    "Operations reports",
    "You do not have permission to view operational reports in this workspace.",
  );
}

export function reportsFinancialDeniedCard(): ReactNode {
  return deniedCard(
    "Financial reports",
    "You do not have permission to view financial reports in this workspace.",
  );
}

export function reportsSavedDeniedCard(): ReactNode {
  return deniedCard(
    "Saved reports",
    "You do not have permission to save or manage report views in this workspace.",
  );
}

export function reportsCustomerPiiDeniedCard(): ReactNode {
  return deniedCard(
    "Customer reports",
    "You do not have permission to view customer PII reports in this workspace.",
  );
}

export function reportsAuditDeniedCard(): ReactNode {
  return deniedCard(
    "Audit reports",
    "You do not have permission to view audit and compliance reports in this workspace.",
  );
}

export function reportPermissionDeniedCard(permission: ReportPermission): ReactNode {
  switch (permission) {
    case "reports.read.financial":
      return reportsFinancialDeniedCard();
    case "reports.read.customer_pii":
      return reportsCustomerPiiDeniedCard();
    case "reports.read.audit":
      return reportsAuditDeniedCard();
    case "reports.saved.manage":
      return reportsSavedDeniedCard();
    default:
      return reportsOperationsDeniedCard();
  }
}

export async function requireReportsPageAccess(requiredPermission: ReportPermission):
  | {
      ok: true;
      actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
      scope: ReturnType<typeof createReportActorScope>;
    }
  | { ok: false; deny: ReactNode } {
  const actor = await requireWorkspacePermissionActor();
  const scope = createReportActorScope(actor);
  if (!canDoReports(scope, requiredPermission)) {
    return { ok: false, deny: reportPermissionDeniedCard(requiredPermission) };
  }
  return { ok: true, actor, scope };
}
