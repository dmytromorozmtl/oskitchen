"use server";

import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { loadMarketplaceProductsBySlugs } from "@/services/marketplace/marketplace-catalog-service";

export async function loadMarketplaceWishlistProductsAction(slugs: string[]) {
  const access = await resolveMarketplaceHubAccess();
  if (!access.canRead) {
    return { ok: false as const, error: "You do not have permission to view the marketplace wish list." };
  }

  const products = await loadMarketplaceProductsBySlugs(slugs);
  return { ok: true as const, products };
}
