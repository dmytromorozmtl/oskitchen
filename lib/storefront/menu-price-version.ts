import { createHash } from "node:crypto";

import type { StorefrontCatalogProduct } from "@/lib/storefront/catalog-types";

export function computeMenuPriceVersion(products: StorefrontCatalogProduct[]): string {
  const payload = products
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => {
      const variants = p.variants
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((v) => `${v.id}:${v.price.toFixed(2)}:${v.soldOut ? 1 : 0}`)
        .join(",");
      const mods = p.modifierGroups
        .flatMap((g) => g.options)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((o) => `${o.id}:${o.priceAdjustment.toFixed(2)}`)
        .join(",");
      return `${p.id}:${p.price.toFixed(2)}:${p.soldOut ? 1 : 0}:${p.availableQty ?? "∞"}:${p.maxStorefrontQuantity ?? "∞"}|v=${variants}|m=${mods}`;
    })
    .join("|");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}
