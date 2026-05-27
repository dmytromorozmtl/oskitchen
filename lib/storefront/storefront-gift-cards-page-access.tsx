import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { requireSessionUser } from "@/lib/auth";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logRewardsPermissionDenied } from "@/services/crm/rewards-permission-audit";
import {
  resolveStorefrontAdminAccess,
  type StorefrontAdminAccess,
} from "@/lib/storefront/storefront-admin-access";
import { canAccessStorefrontGiftCardsTab } from "@/lib/storefront/storefront-gift-cards-permission";
import { canViewStorefrontFromGranted } from "@/lib/storefront/storefront-page-access";

export { canAccessStorefrontGiftCardsTab } from "@/lib/storefront/storefront-gift-cards-permission";

function deniedCard(message: string): ReactNode {
  return createElement(PosAccessCard, {
    title: "Storefront gift cards",
    description: message,
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireStorefrontGiftCardsPageAccess(): Promise<
  | {
      ok: true;
      actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
      access: StorefrontAdminAccess;
    }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  const hubCanRead = canViewStorefrontFromGranted(actor.granted);

  if (!canAccessStorefrontGiftCardsTab(actor.granted, hubCanRead)) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission: "giftcards.manage",
      operation: "storefront.gift_cards.page",
      module: "gift_cards",
      metadata: { hubCanRead },
    });
    return {
      ok: false,
      deny: deniedCard("You do not have permission to manage storefront gift cards."),
    };
  }

  const user = await requireSessionUser();
  const access = await resolveStorefrontAdminAccess(user.id);
  if (!access.ok) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission: "giftcards.manage",
      operation: "storefront.gift_cards.page",
      module: "gift_cards",
      metadata: { storefrontResolved: false, reason: access.error },
    });
    return {
      ok: false,
      deny: deniedCard(access.error ?? "No storefront access."),
    };
  }

  return { ok: true, actor, access };
}
