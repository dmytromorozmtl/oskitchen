import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";

export async function requireGlobalSearchActor(input?: {
  operation?: string;
}): Promise<{ ok: true; dataUserId: string } | { ok: false; error: string }> {
  const permission: PermissionKey = "workspace.view";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "global_search.permission_denied",
      entityType: "GlobalSearch",
      metadata: {
        operation: input?.operation ?? "global_search.run",
        requiredPermission: permission,
      },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, dataUserId: access.actor.dataUserId };
}
