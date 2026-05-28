import { logDomainMutationDenied } from "@/lib/permissions/log-domain-mutation-denied";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";

export async function requirePackingMutation(operation = "packing.mutation") {
  const access = await requireMutationPermission("packing.manage");
  if (!access.ok) {
    await logDomainMutationDenied({
      actor: access.actor,
      requiredPermission: "packing.manage",
      operation,
      domain: "packing",
    });
  }
  return access;
}
