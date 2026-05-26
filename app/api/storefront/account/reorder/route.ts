import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { STOREFRONT_MARKET_COOKIE } from "@/lib/storefront/cache-tags";
import { openServerCart, sealServerCart, SERVER_CART_COOKIE, isServerCartConfigured } from "@/lib/storefront/server-cart";
import { isStorefrontServerCartEnabled } from "@/lib/storefront/storefront-experiments-enabled";
import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import { applyReorderToCart } from "@/services/storefront/storefront-reorder-service";
import { sealCartFromPayload } from "@/services/storefront/storefront-cart-service";

const schema = z.object({
  storeSlug: z.string().min(2).max(120),
  orderToken: z.string().min(8).max(64),
  merge: z.boolean().optional().default(true),
  clientPriceVersion: z.string().max(64).optional(),
});

function jsonWithCartCookie(
  body: Record<string, unknown>,
  catalog: import("@/lib/storefront/catalog-types").StorefrontMenuCatalog,
  cart: import("@/lib/storefront/contracts/cart").StoreCartPayload,
) {
  const res = NextResponse.json(body);
  if (isServerCartConfigured()) {
    const sealed = sealServerCart(sealCartFromPayload(catalog, cart));
    if (sealed) {
      res.cookies.set(SERVER_CART_COOKIE, sealed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }
  return res;
}

/** Rebuild server cart from a past order (variant/modifier aware). */
export async function POST(request: Request) {
  if (!isStorefrontServerCartEnabled()) {
    return NextResponse.json({ error: "Server cart disabled." }, { status: 404 });
  }
  if (!isServerCartConfigured()) {
    return NextResponse.json({ error: "Server cart not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(
    request,
    "storefront_cart_sync",
    `${parsed.data.storeSlug}:reorder`,
  );
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const jar = await cookies();
  const token = jar.get(SERVER_CART_COOKIE)?.value;
  const existing = token ? openServerCart(token, parsed.data.storeSlug) : null;

  const result = await applyReorderToCart({
    storeSlug: parsed.data.storeSlug,
    publicToken: parsed.data.orderToken,
    merge: parsed.data.merge,
    clientPriceVersion: parsed.data.clientPriceVersion ?? existing?.priceVersion,
    existingCartLines: existing?.lines,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.cart.lines.length === 0) {
    return NextResponse.json(
      {
        error: "No items from this order are still on the menu.",
        warnings: result.warnings,
      },
      { status: 409 },
    );
  }

  const marketId = "marketId" in result && result.marketId ? result.marketId : null;
  const redirectTo = marketId
    ? `/s/${parsed.data.storeSlug}/cart?market=${encodeURIComponent(marketId)}`
    : `/s/${parsed.data.storeSlug}/cart`;

  const res = jsonWithCartCookie(
    {
      ok: true,
      cart: result.cart,
      warnings: result.warnings.length ? result.warnings : undefined,
      skippedCount: result.skippedCount,
      redirectTo,
      marketId,
    },
    result.catalog,
    result.cart,
  );

  if (marketId) {
    res.cookies.set(STOREFRONT_MARKET_COOKIE, marketId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}
