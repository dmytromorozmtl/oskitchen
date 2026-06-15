"use client";

import { useCallback, useEffect, useState } from "react";

import { readMarketplaceCompareSlugs } from "@/lib/marketplace/marketplace-compare-storage";
import {
  MARKETPLACE_COMPARE_CHANGE_EVENT,
  MARKETPLACE_WISHLIST_CHANGE_EVENT,
} from "@/lib/marketplace/marketplace-catalog-ux-policy";
import { readMarketplaceWishlistSlugs } from "@/lib/marketplace/wishlist";

export function useMarketplaceCatalogTray() {
  const [compareCount, setCompareCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const sync = useCallback(() => {
    setCompareCount(readMarketplaceCompareSlugs().length);
    setWishlistCount(readMarketplaceWishlistSlugs().length);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(MARKETPLACE_WISHLIST_CHANGE_EVENT, sync);
    window.addEventListener(MARKETPLACE_COMPARE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(MARKETPLACE_WISHLIST_CHANGE_EVENT, sync);
      window.removeEventListener(MARKETPLACE_COMPARE_CHANGE_EVENT, sync);
    };
  }, [sync]);

  return { compareCount, wishlistCount, refresh: sync };
}
