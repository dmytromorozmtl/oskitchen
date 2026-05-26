import type { MenuStrategy } from "@prisma/client";

import { menuStrategyDefinition } from "@/lib/menus/menu-strategies";

export type StorefrontMenuSurface = {
  activeMenuId: string | null;
  storefrontEnabled: boolean;
  storefrontPublished: boolean;
};

export function describeStorefrontLink(opts: {
  menuId: string;
  surface: StorefrontMenuSurface;
  strategy: MenuStrategy;
}): { label: string; tone: "live" | "draft" | "disabled" } {
  const def = menuStrategyDefinition(opts.strategy);
  if (!opts.surface.storefrontEnabled) {
    return { label: "Storefront off", tone: "disabled" };
  }
  if (opts.surface.activeMenuId === opts.menuId) {
    return { label: def.storefrontBehavior.split(".")[0] ?? "Linked to checkout", tone: "live" };
  }
  return { label: "Not the active checkout menu", tone: "draft" };
}
