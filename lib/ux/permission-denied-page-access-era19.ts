import { hasPermission } from "@/lib/permissions/guards";
import { canUseGoLive, type GoLiveCapability } from "@/lib/go-live/go-live-permissions";
import type { GoLiveActorScope } from "@/lib/go-live/go-live-permissions";
import { canUseImplementation } from "@/lib/implementation/implementation-permissions";
import type { ImplementationActorScope } from "@/lib/implementation/implementation-types";
import { canManageStaff } from "@/lib/staff/staff-permissions";
import type { StaffActorScope } from "@/lib/staff/staff-permissions";
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

export function hasImplementationHubPageAccess(
  scope: ImplementationActorScope,
): boolean {
  return canUseImplementation(scope, "implementation.view");
}

export function hasStaffHubPageAccess(
  actor: WorkspacePermissionActor,
  scope: StaffActorScope,
): boolean {
  if (actor.platformBypass || scope.isOwner) return true;
  if (hasPermission(actor.granted, "staff.manage")) return true;
  return canManageStaff(scope, "staff.view");
}

export function hasGoLiveHubPageAccess(
  actor: WorkspacePermissionActor,
  scope: GoLiveActorScope,
  cap: GoLiveCapability = "go-live.view",
): boolean {
  if (actor.platformBypass || scope.isOwner) return true;
  if (cap === "go-live.view") {
    return hasPermission(actor.granted, "workspace.view") && canUseGoLive(scope, cap);
  }
  return hasPermission(actor.granted, "go-live.manage") && canUseGoLive(scope, cap);
}

export function hasCrmCustomersPageAccess(actor: WorkspacePermissionActor): boolean {
  return (
    hasPermission(actor.granted, "customers.read") ||
    hasPermission(actor.granted, "customers.manage")
  );
}

export function hasBillingHubPageAccess(
  actor: WorkspacePermissionActor,
  scope: { isOwner: boolean; platformBypass?: boolean },
): boolean {
  if (actor.platformBypass || scope.isOwner) return true;
  return hasPermission(actor.granted, "billing.view");
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
