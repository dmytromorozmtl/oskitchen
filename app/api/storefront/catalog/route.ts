import { NextResponse } from "next/server";

import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import { loadPublishedStorefrontCatalog } from "@/services/storefront/storefront-cart-service";

/** Public catalog snapshot for QA / headless clients (no prices beyond menu card fields). */
export async function GET(request: Request) {
  const storeSlug = new URL(request.url).searchParams.get("storeSlug")?.trim();
  if (!storeSlug) {
    return NextResponse.json({ error: "storeSlug required." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_cart_sync", storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const catalog = await loadPublishedStorefrontCatalog(storeSlug);
  if (!catalog) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true as const,
    menuId: catalog.menuId,
    priceVersion: catalog.priceVersion,
    currency: catalog.currency,
    products: catalog.products.map((p) => ({
      id: p.id,
      title: p.title,
      soldOut: p.soldOut,
      canAddToCart: p.canAddToCart,
      availableQty: p.availableQty,
      variantCount: p.variants?.length ?? 0,
    })),
  });
}
