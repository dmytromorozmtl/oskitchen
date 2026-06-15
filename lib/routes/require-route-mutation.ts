import { logDomainMutationDenied } from "@/lib/permissions/log-domain-mutation-denied";
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
    await logDomainMutationDenied({
      action: "routes.permission_denied",
      entityType: "DeliveryRoute",
      actor: access.actor,
      metadata: { operation, requiredPermission: "routes.manage" },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, actor: access.actor };
}
