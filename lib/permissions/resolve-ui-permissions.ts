import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

/** Serialize workspace permission set for client `PermissionGate`. */
export async function resolveUiWorkspacePermissions(): Promise<PermissionKey[]> {
  const actor = await requireWorkspacePermissionActor();
  return [...actor.granted];
}
