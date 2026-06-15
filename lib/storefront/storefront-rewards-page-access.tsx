import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { requireSessionUser } from "@/lib/auth";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  resolveStorefrontAdminAccess,
  type StorefrontAdminAccess,
} from "@/lib/storefront/storefront-admin-access";
import { canViewStorefrontFromGranted } from "@/lib/storefront/storefront-page-access";
import {
  canAccessStorefrontRewardsTab,
  storefrontRewardsPageOperation,
  storefrontRewardsPermission,
  type StorefrontRewardsModule,
} from "@/lib/storefront/storefront-rewards-permission";
import { logRewardsPermissionDenied } from "@/services/crm/rewards-permission-audit";

export type { StorefrontRewardsModule } from "@/lib/storefront/storefront-rewards-permission";
export {
  canAccessStorefrontGiftCardsTab,
  canAccessStorefrontLoyaltyTab,
  canAccessStorefrontRewardsTab,
} from "@/lib/storefront/storefront-rewards-permission";

const PAGE_COPY: Record<StorefrontRewardsModule, { title: string; denied: string }> = {
  gift_cards: {
    title: "Storefront gift cards",
    denied: "You do not have permission to manage storefront gift cards.",
  },
  loyalty: {
    title: "Storefront loyalty",
    denied: "You do not have permission to manage storefront loyalty.",
  },
};

function deniedCard(module: StorefrontRewardsModule, message: string): ReactNode {
  return createElement(PosAccessCard, {
    title: PAGE_COPY[module].title,
    description: message,
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireStorefrontRewardsPageAccess(module: StorefrontRewardsModule): Promise<
  | {
      ok: true;
      actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
      access: StorefrontAdminAccess;
    }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  const hubCanRead = canViewStorefrontFromGranted(actor.granted);
  const requiredPermission = storefrontRewardsPermission(module);
  const operation = storefrontRewardsPageOperation(module);

  if (!canAccessStorefrontRewardsTab(module, actor.granted, hubCanRead)) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission,
      operation,
      module,
      metadata: { hubCanRead },
    });
    return {
      ok: false,
      deny: deniedCard(module, PAGE_COPY[module].denied),
    };
  }

  const user = await requireSessionUser();
  const access = await resolveStorefrontAdminAccess(user.id);
  if (!access.ok) {
    await logRewardsPermissionDenied(actor, {
      requiredPermission,
      operation,
      module,
      metadata: { storefrontResolved: false, reason: access.error },
    });
    return {
      ok: false,
      deny: deniedCard(module, access.error ?? "No storefront access."),
    };
  }

  return { ok: true, actor, access };
}

export async function requireStorefrontGiftCardsPageAccess() {
  return requireStorefrontRewardsPageAccess("gift_cards");
}

export async function requireStorefrontLoyaltyPageAccess() {
  return requireStorefrontRewardsPageAccess("loyalty");
}
