import { hasPermission } from "@/lib/permissions/guards";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";
import type { PermissionDeniedSurfaceId } from "@/lib/ux/permission-denied-copy";

export const PERMISSION_DENIED_PAGE_ACCESS_ERA19_POLICY_ID =
  "era19-permission-denied-page-access-v1" as const;

export function hasPackingManagePageAccess(actor: WorkspacePermissionActor): boolean {
  return hasPermission(actor.granted, "packing.manage");
}

export function hasProductionManagePageAccess(actor: WorkspacePermissionActor): boolean {
  return hasPermission(actor.granted, "production.manage");
}

export function hasOrderHubPageAccess(actor: WorkspacePermissionActor): boolean {
  return hasPermission(actor.granted, "orders.manage");
}

export function hasIntegrationHealthPageAccess(actor: WorkspacePermissionActor): boolean {
  return (
    hasPermission(actor.granted, "integrations.read") ||
    hasPermission(actor.granted, "integrations.manage")
  );
}

export function hasLaunchWizardPageAccess(actor: WorkspacePermissionActor): boolean {
  return actor.workspaceRole === "OWNER" || hasPermission(actor.granted, "workspace.view");
}

export function hasReportsHubPageAccess(actor: WorkspacePermissionActor): boolean {
  return (
    hasPermission(actor.granted, "reports.read.operations") ||
    hasPermission(actor.granted, "reports.read.financial") ||
    hasPermission(actor.granted, "reports.read.customer_pii") ||
    hasPermission(actor.granted, "reports.read.audit")
  );
}

/** Inventory routes align with production.manage capability gate (inventoryWrite). */
export function hasInventoryOperationsPageAccess(actor: WorkspacePermissionActor): boolean {
  return hasPermission(actor.granted, "production.manage");
}

export function resolvePackingDeniedSurfaceId(
  page: "command" | "verify" | "scanner" | "reports",
): PermissionDeniedSurfaceId {
  return page === "verify" ? "packing_verify" : "packing_command";
}

export function resolveProductionDeniedSurfaceId(
  page: "board" | "calendar" | "templates" | "reports" | "batch",
): PermissionDeniedSurfaceId {
  return page === "calendar" ? "production_calendar" : "production_board";
}

export async function loadWorkspacePermissionPageActor(): Promise<WorkspacePermissionActor> {
  return requireWorkspacePermissionActor();
}
