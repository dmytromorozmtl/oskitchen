"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { STOREFRONT_MARKET_COOKIE } from "@/lib/storefront/cache-tags";

/** Persists ?market= to cookie so navigation keeps the active market. */
export function StorefrontMarketSync() {
  const searchParams = useSearchParams();
  const market = searchParams.get("market")?.trim();

  useEffect(() => {
    if (!market) return;
    document.cookie = `${STOREFRONT_MARKET_COOKIE}=${encodeURIComponent(market)};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, [market]);

  return null;
}
