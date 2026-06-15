import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { cartLineKey } from "@/lib/storefront/cart-line-key";
import { storeCartPatchSchema, type StoreCartLine } from "@/lib/storefront/contracts/cart";
import { isServerCartConfigured, sealServerCart, SERVER_CART_COOKIE, openServerCart } from "@/lib/storefront/server-cart";
import { isStorefrontServerCartEnabled } from "@/lib/storefront/storefront-experiments-enabled";
import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import {
  resolveStorefrontCart,
  sealCartFromPayload,
  syncCartFromRecord,
} from "@/services/storefront/storefront-cart-service";

function disabled() {
  return NextResponse.json({ error: "Server cart disabled." }, { status: 404 });
}

function notConfigured() {
  return NextResponse.json({ error: "Server cart not configured." }, { status: 503 });
}

function jsonCartResponse(
  cart: import("@/lib/storefront/contracts/cart").StoreCartPayload,
  warnings: import("@/lib/storefront/contracts/cart").StoreCartWarning[],
  catalog: import("@/lib/storefront/catalog-types").StorefrontMenuCatalog,
) {
  const res = NextResponse.json({ ok: true as const, cart, warnings: warnings.length ? warnings : undefined });
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
  return res;
}

export async function GET(request: Request) {
  if (!isStorefrontServerCartEnabled()) return disabled();
  if (!isServerCartConfigured()) return notConfigured();

  const storeSlug = new URL(request.url).searchParams.get("storeSlug")?.trim();
  if (!storeSlug) {
    return NextResponse.json({ error: "storeSlug required." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_cart_sync", storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const jar = await cookies();
  const token = jar.get(SERVER_CART_COOKIE)?.value;
  const existing = token ? openServerCart(token, storeSlug) : null;
  const lines = existing?.lines ?? [];

  const resolved = await resolveStorefrontCart({
    storeSlug,
    rawLines: lines,
    clientPriceVersion: existing?.priceVersion,
  });
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  return jsonCartResponse(resolved.cart, resolved.warnings, resolved.catalog);
}

export async function PATCH(request: Request) {
  if (!isStorefrontServerCartEnabled()) return disabled();
  if (!isServerCartConfigured()) return notConfigured();

  const body = await request.json().catch(() => null);
  const parsed = storeCartPatchSchema.safeParse(body);
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

  const jar = await cookies();
  const token = jar.get(SERVER_CART_COOKIE)?.value;
  const existing = token ? openServerCart(token, parsed.data.storeSlug) : null;

  let record: Record<string, number> = {};
  let cartLines: StoreCartLine[] | undefined;
  if (parsed.data.lineDelta) {
    const deltaLine: StoreCartLine = {
      productId: parsed.data.lineDelta.productId,
      variantId: parsed.data.lineDelta.variantId,
      modifierOptionIds: parsed.data.lineDelta.modifierOptionIds,
      quantity: Math.max(0, parsed.data.lineDelta.delta),
    };
    const base = existing?.lines ?? [];
    const map = new Map(base.map((l) => [cartLineKey(l), l]));
    const key = cartLineKey(deltaLine);
    const cur = map.get(key);
    const next = (cur?.quantity ?? 0) + parsed.data.lineDelta.delta;
    if (next > 0) {
      map.set(key, { ...deltaLine, quantity: next });
    } else {
      map.delete(key);
    }
    cartLines = [...map.values()];
  } else if (parsed.data.cartLines?.length) {
    cartLines = parsed.data.cartLines;
  } else if (parsed.data.lines) {
    record = parsed.data.lines;
  }

  const synced = await syncCartFromRecord({
    storeSlug: parsed.data.storeSlug,
    record,
    cartLines,
    merge: parsed.data.merge,
    existing: existing?.lines,
    clientPriceVersion: parsed.data.clientPriceVersion ?? existing?.priceVersion,
  });

  if (!synced.ok) {
    return NextResponse.json({ error: synced.error }, { status: synced.status });
  }

  if (
    parsed.data.clientPriceVersion &&
    parsed.data.clientPriceVersion !== synced.catalog.priceVersion &&
    synced.warnings.some((w) => w.code === "MENU_CHANGED")
  ) {
    return NextResponse.json(
      {
        error: "Menu changed — cart refreshed with current prices.",
        cart: synced.cart,
        warnings: synced.warnings,
      },
      { status: 409 },
    );
  }

  return jsonCartResponse(synced.cart, synced.warnings, synced.catalog);
}

/** POST — full replace (checkout sync, recovery merge). */
export async function POST(request: Request) {
  if (!isStorefrontServerCartEnabled()) return disabled();
  if (!isServerCartConfigured()) return notConfigured();

  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      storeSlug: z.string().min(2).max(120),
      cart: z.record(z.string().uuid(), z.number().int().min(0).max(500)).optional(),
      merge: z.boolean().optional().default(true),
      clientPriceVersion: z.string().max(64).optional(),
    })
    .safeParse(body);
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

  const synced = await syncCartFromRecord({
    storeSlug: parsed.data.storeSlug,
    record: parsed.data.cart ?? {},
    merge: parsed.data.merge,
    clientPriceVersion: parsed.data.clientPriceVersion,
  });

  if (!synced.ok) {
    return NextResponse.json({ error: synced.error }, { status: synced.status });
  }

  return jsonCartResponse(synced.cart, synced.warnings, synced.catalog);
}

export async function DELETE(request: Request) {
  if (!isStorefrontServerCartEnabled()) return disabled();

  const storeSlug = new URL(request.url).searchParams.get("storeSlug")?.trim();
  if (!storeSlug) {
    return NextResponse.json({ error: "storeSlug required." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SERVER_CART_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
