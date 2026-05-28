import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export type RouteMutationAccessResult =
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string };

export async function requireRouteMutation(input?: {
  operation?: string;
}): Promise<RouteMutationAccessResult> {
  const operation = input?.operation ?? "routes.mutate";
  const access = await requireMutationPermission("routes.manage");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "routes.permission_denied",
      entityType: "DeliveryRoute",
      metadata: {
        operation,
        requiredPermission: "routes.manage",
      },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, actor: access.actor };
}
