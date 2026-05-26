import { NextResponse } from "next/server";

import { shippingQuoteRequestSchema } from "@/lib/storefront/contracts/checkout-v2";
import { quoteStorefrontShipping } from "@/lib/storefront/shipping-engine";
import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = shippingQuoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(
    request,
    "storefront_cart_sync",
    parsed.data.storeSlug,
  );
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug, enabled: true, published: true },
    select: {
      deliveryEnabled: true,
      deliveryZonesJson: true,
      storefrontDeliveryFee: true,
      freeDeliveryThreshold: true,
    },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  const quote = quoteStorefrontShipping(sf, {
    fulfillmentType: parsed.data.fulfillmentType,
    deliveryAddress: parsed.data.deliveryAddress,
    subtotal: parsed.data.subtotal,
  });

  if (!quote.ok) {
    return NextResponse.json({ error: quote.error, lines: quote.lines }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    deliveryFee: quote.deliveryFee,
    matchedZoneName: quote.matchedZoneName,
    lines: quote.lines,
  });
}
