import { logDomainMutationDenied } from "@/lib/permissions/log-domain-mutation-denied";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export type RestaurantTableMutationAccessResult =
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string };

/** FOH table floor mutations (preview module) require POS access. */
export async function requireRestaurantTableMutation(input: {
  operation: string;
}): Promise<RestaurantTableMutationAccessResult> {
  const access = await requireMutationPermission("pos.access");
  if (!access.ok) {
    await logDomainMutationDenied({
      action: "restaurant_tables.permission_denied",
      entityType: "RestaurantTable",
      actor: access.actor,
      metadata: {
        operation: input.operation,
        requiredPermission: "pos.access",
      },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, actor: access.actor };
}
