"use client";

import * as React from "react";

import type { StoreCartPayload, StoreCartWarning } from "@/lib/storefront/contracts/cart";
import {
  fetchStorefrontCart,
  patchStorefrontCart,
  recordFromCart,
} from "@/lib/storefront/cart-api-client";
import { readCartFromStorage } from "@/lib/storefront/cart";

export function useStorefrontCart(storeSlug: string, initialPriceVersion?: string) {
  const [cart, setCart] = React.useState<StoreCartPayload | null>(null);
  const [warnings, setWarnings] = React.useState<StoreCartWarning[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const priceVersionRef = React.useRef(initialPriceVersion);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const res = await fetchStorefrontCart(storeSlug);
    setLoading(false);
    if (res.ok) {
      setCart(res.cart);
      setWarnings(res.warnings ?? []);
      priceVersionRef.current = res.cart.priceVersion;
    }
  }, [storeSlug]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    const h = () => void refresh();
    window.addEventListener("kos-store-cart", h);
    return () => window.removeEventListener("kos-store-cart", h);
  }, [refresh]);

  const bump = React.useCallback(
    async (
      productId: string,
      delta: number,
      opts?: { variantId?: string; modifierOptionIds?: string[] },
    ) => {
      setSyncing(true);
      const res = await patchStorefrontCart({
        storeSlug,
        lineDelta: {
          productId,
          delta,
          variantId: opts?.variantId,
          modifierOptionIds: opts?.modifierOptionIds,
        },
        merge: true,
        clientPriceVersion: priceVersionRef.current ?? cart?.priceVersion,
      });
      setSyncing(false);
      if (res.ok) {
        setCart(res.cart);
        setWarnings(res.warnings ?? []);
        priceVersionRef.current = res.cart.priceVersion;
        return { ok: true as const };
      }
      if (res.cart) {
        setCart(res.cart);
        setWarnings(res.warnings ?? []);
        priceVersionRef.current = res.cart.priceVersion;
      }
      return { ok: false as const, error: res.error };
    },
    [storeSlug, cart?.priceVersion],
  );

  const quantities = React.useMemo(() => {
    if (cart) return recordFromCart(cart);
    return readCartFromStorage(storeSlug);
  }, [cart, storeSlug]);

  const itemCount = cart?.itemCount ?? Object.values(quantities).reduce((a, b) => a + b, 0);

  return {
    cart,
    warnings,
    loading,
    syncing,
    quantities,
    itemCount,
    priceVersion: cart?.priceVersion ?? priceVersionRef.current,
    bump,
    refresh,
  };
}
