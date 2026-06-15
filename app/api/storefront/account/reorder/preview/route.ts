import { NextResponse } from "next/server";

import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import { previewStorefrontReorder } from "@/services/storefront/storefront-reorder-preview";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storeSlug = url.searchParams.get("storeSlug")?.trim();
  const orderToken = url.searchParams.get("orderToken")?.trim();

  if (!storeSlug || !orderToken) {
    return NextResponse.json({ error: "storeSlug and orderToken required." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(
    request,
    "storefront_cart_sync",
    `${storeSlug}:reorder-preview`,
  );
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const result = await previewStorefrontReorder({ storeSlug, publicToken: orderToken });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
