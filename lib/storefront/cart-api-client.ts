"use client";

import type { StoreCartApiResponse, StoreCartPayload } from "@/lib/storefront/contracts/cart";
import { writeCartToStorage } from "@/lib/storefront/cart";

export type CartApiError = {
  ok: false;
  error: string;
  status: number;
  cart?: StoreCartPayload;
  warnings?: StoreCartApiResponse["warnings"];
};

export async function fetchStorefrontCart(storeSlug: string): Promise<StoreCartApiResponse | CartApiError> {
  const res = await fetch(`/api/storefront/cart?storeSlug=${encodeURIComponent(storeSlug)}`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: typeof data.error === "string" ? data.error : "Cart unavailable.",
      status: res.status,
      cart: data.cart,
      warnings: data.warnings,
    };
  }
  if (data?.cart) {
    writeCartToStorage(storeSlug, recordFromCart(data.cart as StoreCartPayload));
    window.dispatchEvent(new Event("kos-store-cart"));
  }
  return data as StoreCartApiResponse;
}

export async function patchStorefrontCart(input: {
  storeSlug: string;
  lines?: Record<string, number>;
  cartLines?: import("@/lib/storefront/contracts/cart").StoreCartLine[];
  lineDelta?: {
    productId: string;
    variantId?: string;
    modifierOptionIds?: string[];
    delta: number;
  };
  merge?: boolean;
  clientPriceVersion?: string;
}): Promise<StoreCartApiResponse | CartApiError> {
  const res = await fetch("/api/storefront/cart", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: typeof data.error === "string" ? data.error : "Could not update cart.",
      status: res.status,
      cart: data.cart,
      warnings: data.warnings,
    };
  }
  if (data?.cart) {
    writeCartToStorage(input.storeSlug, recordFromCart(data.cart as StoreCartPayload));
    window.dispatchEvent(new Event("kos-store-cart"));
  }
  return data as StoreCartApiResponse;
}

export function recordFromCart(cart: StoreCartPayload): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of cart.lines) {
    out[l.lineKey ?? l.productId] = l.quantity;
  }
  return out;
}
