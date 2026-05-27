import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export type StorefrontRewardsModule = "gift_cards" | "loyalty";

const STOREFRONT_REWARDS_TAB: Record<
  StorefrontRewardsModule,
  { permission: PermissionKey; operation: string }
> = {
  gift_cards: {
    permission: "giftcards.manage",
    operation: "storefront.gift_cards.page",
  },
  loyalty: {
    permission: "loyalty.manage",
    operation: "storefront.loyalty.page",
  },
};

export function storefrontRewardsPermission(module: StorefrontRewardsModule): PermissionKey {
  return STOREFRONT_REWARDS_TAB[module].permission;
}

export function storefrontRewardsPageOperation(module: StorefrontRewardsModule): string {
  return STOREFRONT_REWARDS_TAB[module].operation;
}

export function canAccessStorefrontRewardsTab(
  module: StorefrontRewardsModule,
  granted: ReadonlySet<PermissionKey>,
  hubCanRead: boolean,
): boolean {
  return hubCanRead && hasPermission(granted, storefrontRewardsPermission(module));
}

export function canAccessStorefrontGiftCardsTab(
  granted: ReadonlySet<PermissionKey>,
  hubCanRead: boolean,
): boolean {
  return canAccessStorefrontRewardsTab("gift_cards", granted, hubCanRead);
}

export function canAccessStorefrontLoyaltyTab(
  granted: ReadonlySet<PermissionKey>,
  hubCanRead: boolean,
): boolean {
  return canAccessStorefrontRewardsTab("loyalty", granted, hubCanRead);
}
