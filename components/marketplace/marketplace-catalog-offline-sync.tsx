"use client";

import { useEffect } from "react";

import { saveOfflineCatalogProducts, type OfflineCatalogProduct } from "@/lib/marketplace/mobile-ui";

export function MarketplaceCatalogOfflineSync({
  products,
}: {
  products: OfflineCatalogProduct[];
}) {
  useEffect(() => {
    if (products.length === 0) return;
    saveOfflineCatalogProducts(products);
  }, [products]);

  return null;
}
