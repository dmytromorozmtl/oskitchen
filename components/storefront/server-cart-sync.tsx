"use client";

import { useEffect, useRef } from "react";

import { fetchStorefrontCart } from "@/lib/storefront/cart-api-client";

type Props = {
  storeSlug: string;
};

/** Hydrates server-authoritative cart on storefront pages (menu is primary writer). */
export function ServerCartSync({ storeSlug }: Props) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void fetchStorefrontCart(storeSlug).catch(() => undefined);
  }, [storeSlug]);

  return null;
}
