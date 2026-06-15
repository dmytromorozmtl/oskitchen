import type { ReactNode } from "react";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

/**
 * Server component — workspace RBAC gate (Phase C).
 * Prefer over legacy `PermissionGate` for new dashboard surfaces.
 */
export async function WorkspacePermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
