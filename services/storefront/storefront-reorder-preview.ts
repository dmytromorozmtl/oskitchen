import type { ReorderLine } from "@/lib/storefront/reorder-types";
import { loadPublishedStorefrontCatalog } from "@/services/storefront/storefront-menu-catalog-service";
import {
  loadReorderLinesForOrder,
  reorderLinesToCartLines,
} from "@/services/storefront/storefront-reorder-service";
import { syncCartFromRecord } from "@/services/storefront/storefront-cart-service";

export type ReorderPreviewLine = {
  title: string;
  quantity: number;
  status: "available" | "sold_out" | "not_on_menu" | "invalid_variant" | "invalid_modifiers";
  message?: string;
};

export async function previewStorefrontReorder(input: {
  storeSlug: string;
  publicToken: string;
}) {
  const loaded = await loadReorderLinesForOrder({
    storeSlug: input.storeSlug,
    publicToken: input.publicToken,
  });
  if (!loaded.ok) return loaded;

  const catalog = await loadPublishedStorefrontCatalog(input.storeSlug);
  if (!catalog) {
    return { ok: false as const, error: "Storefront not found.", status: 404 };
  }

  const preview: ReorderPreviewLine[] = [];
  const availableLines: ReorderLine[] = [];

  for (const line of loaded.lines) {
    const p = catalog.products.find((x) => x.id === line.productId);
    if (!p) {
      preview.push({
        title: line.title ?? "Item",
        quantity: line.quantity,
        status: "not_on_menu",
        message: "No longer on the menu",
      });
      continue;
    }
    if (p.soldOut) {
      preview.push({
        title: line.title ?? p.title,
        quantity: line.quantity,
        status: "sold_out",
        message: "Sold out",
      });
      continue;
    }
    if (line.variantId && !p.variants.some((v) => v.id === line.variantId && v.canAddToCart)) {
      preview.push({
        title: line.title ?? p.title,
        quantity: line.quantity,
        status: "invalid_variant",
        message: "Variant unavailable",
      });
      continue;
    }
    preview.push({
      title: line.title ?? p.title,
      quantity: line.quantity,
      status: "available",
    });
    availableLines.push(line);
  }

  const synced = await syncCartFromRecord({
    storeSlug: input.storeSlug,
    record: {},
    cartLines: reorderLinesToCartLines(availableLines),
    merge: false,
  });

  return {
    ok: true as const,
    lines: preview,
    availableCount: synced.ok ? synced.cart.lines.length : 0,
    subtotal: synced.ok ? synced.cart.subtotal : 0,
    warnings: synced.ok ? synced.warnings : [],
  };
}
