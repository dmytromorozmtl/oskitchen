import type { PermissionKey as LegacyPermissionKey } from "@/lib/permissions/legacy";
import { hasLegacyPermission } from "@/lib/permissions/legacy";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey as WorkspacePermissionKey } from "@/lib/permissions/permissions";
import { LEGACY_TO_WORKSPACE } from "@/lib/permissions/legacy-to-workspace-map";

export function PermissionGate({
  role,
  permission,
  workspaceGranted,
  children,
  fallback = null,
}: {
  role: string | null | undefined;
  permission: LegacyPermissionKey;
  /** When provided (from server), workspace matrix is checked first (Phase C). */
  workspaceGranted?: ReadonlySet<WorkspacePermissionKey>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const mapped = LEGACY_TO_WORKSPACE[permission];
  if (workspaceGranted && mapped && hasPermission(workspaceGranted, mapped)) {
    return <>{children}</>;
  }
  return hasLegacyPermission(role, permission) ? <>{children}</> : <>{fallback}</>;
}
