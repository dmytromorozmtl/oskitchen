import { recordAuditLog } from "@/lib/audit-log";
import { hasPermission } from "@/lib/permissions/guards";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";

const ORDER_CREATE_PERMISSION: PermissionKey = "orders.manage";

/** Server-side gate for manual / dashboard order creation mutations. */
export async function requireOrderCreateAccess(input?: {
  operation?: string;
  metadata?: Record<string, unknown>;
}) {
  const operation = input?.operation ?? "orders.create";
  const access = await requireMutationPermission(ORDER_CREATE_PERMISSION);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "orders.permission_denied",
      entityType: "Order",
      metadata: {
        operation,
        requiredPermission: ORDER_CREATE_PERMISSION,
        ...input?.metadata,
      },
    });
    return {
      ok: false as const,
      error: access.error,
    };
  }
  return {
    ok: true as const,
    actor: access.actor,
    operation,
    metadata: input?.metadata,
  };
}

/** UI/page gate mirroring server order-create permission. */
export async function canAccessOrderCreatePage(): Promise<boolean> {
  const access = await requireMutationPermission(ORDER_CREATE_PERMISSION);
  if (!access.ok) return false;
  return hasPermission(access.actor.granted, ORDER_CREATE_PERMISSION);
}
