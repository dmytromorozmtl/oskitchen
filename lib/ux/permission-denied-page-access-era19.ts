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
