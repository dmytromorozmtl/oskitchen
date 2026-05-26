import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { getUpsellsForCart } from "@/services/storefront/upsell-service";

export async function GET(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "resolve-redirect");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const url = new URL(request.url);
  const storeSlug = url.searchParams.get("storeSlug")?.trim();
  const productIds = (url.searchParams.get("productIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!storeSlug) {
    return NextResponse.json({ error: "storeSlug required." }, { status: 400 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug, enabled: true, published: true },
    select: { id: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const suggestions = await getUpsellsForCart({ storefrontId: sf.id, productIds });
  return NextResponse.json({ ok: true as const, suggestions });
}
