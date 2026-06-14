import { parseStorefrontCartSnapshot } from "@/lib/storefront/cart-snapshot";
import type { StoreCartLine } from "@/lib/storefront/contracts/cart";
import type { ReorderLine } from "@/lib/storefront/reorder-types";
import { prisma } from "@/lib/prisma";
import { syncCartFromRecord } from "@/services/storefront/storefront-cart-service";

function parseModifiersJson(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.optionIds)) {
    return o.optionIds.filter((x): x is string => typeof x === "string");
  }
  return [];
}

function linesFromCartJson(raw: unknown): { lines: ReorderLine[]; marketId: string | null } {
  const parsed = parseStorefrontCartSnapshot(raw);
  const out: ReorderLine[] = parsed.lines.map((row) => ({
    productId: row.productId,
    variantId: row.variantId,
    modifierOptionIds: row.modifierOptionIds,
    quantity: Math.min(500, Math.floor(row.quantity)),
    title: row.title,
  }));
  return { lines: out, marketId: parsed.marketId };
}

export async function loadReorderLinesForOrder(input: {
  storeSlug: string;
  publicToken: string;
}): Promise<
  | { ok: false; error: string; status: number }
  | { ok: true; lines: ReorderLine[]; marketId: string | null }
> {
  const order = await prisma.storefrontOrder.findFirst({
    where: {
      publicToken: input.publicToken,
      storefront: { storeSlug: input.storeSlug, enabled: true, published: true },
    },
    include: {
      lineItems: {
        where: { productId: { not: null } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return { ok: false, error: "Order not found.", status: 404 };
  }

  if (order.lineItems.length > 0) {
    const lines: ReorderLine[] = order.lineItems
      .filter((li) => li.productId)
      .map((li) => ({
        productId: li.productId!,
        variantId: li.variantId ?? undefined,
        modifierOptionIds: parseModifiersJson(li.modifiersJson),
        quantity: li.quantity,
        title: li.title,
      }));
    return { ok: true, lines, marketId: parseStorefrontCartSnapshot(order.cartJson).marketId };
  }

  const fromJson = linesFromCartJson(order.cartJson);
  if (fromJson.lines.length === 0) {
    return { ok: false, error: "This order has no items to reorder.", status: 400 };
  }
  return { ok: true, lines: fromJson.lines, marketId: fromJson.marketId };
}

export function reorderLinesToCartLines(lines: ReorderLine[]): StoreCartLine[] {
  return lines.map((l) => ({
    productId: l.productId,
    variantId: l.variantId,
    modifierOptionIds: l.modifierOptionIds?.length ? l.modifierOptionIds : undefined,
    quantity: l.quantity,
  }));
}

export async function applyReorderToCart(input: {
  storeSlug: string;
  publicToken: string;
  merge: boolean;
  clientPriceVersion?: string;
  existingCartLines?: StoreCartLine[];
}) {
  const loaded = await loadReorderLinesForOrder({
    storeSlug: input.storeSlug,
    publicToken: input.publicToken,
  });
  if (!loaded.ok) return loaded;

  const cartLines = reorderLinesToCartLines(loaded.lines);
  const synced = await syncCartFromRecord({
    storeSlug: input.storeSlug,
    record: {},
    cartLines,
    merge: input.merge,
    existing: input.existingCartLines,
    clientPriceVersion: input.clientPriceVersion,
  });

  if (!synced.ok) {
    return { ok: false as const, error: synced.error, status: synced.status };
  }

  const skippedCount = loaded.lines.length - synced.cart.lines.length;
  return {
    ok: true as const,
    cart: synced.cart,
    warnings: synced.warnings,
    catalog: synced.catalog,
    marketId: loaded.marketId,
    skippedCount: skippedCount > 0 ? skippedCount : undefined,
  };
}
