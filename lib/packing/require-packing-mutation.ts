import { logDomainMutationDenied } from "@/lib/permissions/log-domain-mutation-denied";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";

export async function requirePackingMutation(operation = "packing.mutation") {
  const access = await requireMutationPermission("packing.manage");
  if (!access.ok) {
    await logDomainMutationDenied({
      action: "packing.permission_denied",
      entityType: "PackingStation",
      actor: access.actor,
      metadata: { operation, requiredPermission: "packing.manage" },
    });
  }
  return access;
}
