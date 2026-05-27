import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  requireMutationPermission,
  type MutationAccessResult,
} from "@/lib/permissions/mutation-access";

/**
 * Kitchen mutations may be authorized by canonical kitchen keys or production.manage
 * (production board parity during RBAC migration).
 */
export async function requireKitchenMutationAccess(
  required: PermissionKey,
  options?: { allowProductionManage?: boolean },
): Promise<MutationAccessResult> {
  const kitchen = await requireMutationPermission(required);
  if (kitchen.ok) return kitchen;
  if (options?.allowProductionManage !== false) {
    const production = await requireMutationPermission("production.manage");
    if (production.ok) return production;
  }
  return kitchen;
}
