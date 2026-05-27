import type { PermissionKey } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logRewardsPermissionDenied } from "@/services/crm/rewards-permission-audit";

export async function requireRewardsMutation(input: {
  required: PermissionKey;
  operation: string;
  module: "gift_cards" | "loyalty";
}): Promise<
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string }
> {
  const access = await requireMutationPermission(input.required);
  if (!access.ok) {
    await logRewardsPermissionDenied(access.actor, {
      requiredPermission: input.required,
      operation: input.operation,
      module: input.module,
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, actor: access.actor };
}

/** POS terminal lookups during checkout. */
export function canLookupRewardsBalance(
  actor: WorkspacePermissionActor,
  module: "gift_cards" | "loyalty",
): boolean {
  if (module === "gift_cards") {
    return (
      hasPermission(actor.granted, "giftcards.manage") ||
      hasPermission(actor.granted, "pos.checkout")
    );
  }
  return (
    hasPermission(actor.granted, "loyalty.manage") ||
    hasPermission(actor.granted, "customers.manage") ||
    hasPermission(actor.granted, "pos.checkout")
  );
}
