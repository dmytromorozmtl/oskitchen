import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { requireSessionUser } from "@/lib/auth";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logRewardsPermissionDenied } from "@/services/crm/rewards-permission-audit";
import {
  resolveStorefrontAdminAccess,
  type StorefrontAdminAccess,
} from "@/lib/storefront/storefront-admin-access";
import { canAccessStorefrontLoyaltyTab } from "@/lib/storefront/storefront-loyalty-permission";
import { canViewStorefrontFromGranted } from "@/lib/storefront/storefront-page-access";

export { canAccessStorefrontLoyaltyTab } from "@/lib/storefront/storefront-loyalty-permission";

function deniedCard(message: string): ReactNode {
  return createElement(PosAccessCard, {
    title: "Storefront loyalty",
    description: message,
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireStorefrontLoyaltyPageAccess(): Promise<
  | {
      ok: true;
      actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
      access: StorefrontAdminAccess;
    }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  const hubCanRead = canViewStorefrontFromGranted(actor.granted);

  if (!canAccessStorefrontLoyaltyTab(actor.granted, hubCanRead)) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission: "loyalty.manage",
      operation: "storefront.loyalty.page",
      module: "loyalty",
      metadata: { hubCanRead },
    });
    return {
      ok: false,
      deny: deniedCard("You do not have permission to manage storefront loyalty."),
    };
  }

  const user = await requireSessionUser();
  const access = await resolveStorefrontAdminAccess(user.id);
  if (!access.ok) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission: "loyalty.manage",
      operation: "storefront.loyalty.page",
      module: "loyalty",
      metadata: { storefrontResolved: false, reason: access.error },
    });
    return {
      ok: false,
      deny: deniedCard(access.error ?? "No storefront access."),
    };
  }

  return { ok: true, actor, access };
}
