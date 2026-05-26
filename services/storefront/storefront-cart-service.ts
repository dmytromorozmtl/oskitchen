import type { StoreCartLine, StoreCartLinePriced, StoreCartPayload, StoreCartWarning } from "@/lib/storefront/contracts/cart";
import type { StorefrontCatalogProduct, StorefrontMenuCatalog } from "@/lib/storefront/catalog-types";
import { cartLineKey, normalizeModifierIds } from "@/lib/storefront/cart-line-key";
import { validateRequiredModifiers } from "@/lib/storefront/modifier-validation";
import { linesToRecord, mergeCartLines, type ServerCartPayload } from "@/lib/storefront/server-cart";
import { buildStorefrontMenuCatalog, loadPublishedStorefrontCatalog } from "@/services/storefront/storefront-menu-catalog-service";

function validateModifiers(
  product: StorefrontCatalogProduct,
  modifierOptionIds: string[],
): { ok: true; labels: string[]; extra: number } | { ok: false; warning: StoreCartWarning } {
  const ids = normalizeModifierIds(modifierOptionIds);

  const requiredCheck = validateRequiredModifiers(product.modifierGroups, ids);
  if (!requiredCheck.ok) {
    return {
      ok: false,
      warning: {
        code: "INVALID_MODIFIERS",
        productId: product.id,
        message: requiredCheck.message ?? "Please complete required options.",
      },
    };
  }

  if (ids.length === 0) return { ok: true, labels: [], extra: 0 };

  const optionMap = new Map<string, { groupId: string; name: string; price: number }>();
  for (const g of product.modifierGroups) {
    for (const o of g.options) {
      optionMap.set(o.id, { groupId: g.id, name: o.name, price: o.priceAdjustment });
    }
  }

  const byGroup = new Map<string, string[]>();
  for (const id of ids) {
    const opt = optionMap.get(id);
    if (!opt) {
      return {
        ok: false,
        warning: {
          code: "INVALID_MODIFIERS",
          productId: product.id,
          message: `Invalid modifier selection for “${product.title}”.`,
        },
      };
    }
    const list = byGroup.get(opt.groupId) ?? [];
    list.push(id);
    byGroup.set(opt.groupId, list);
  }

  for (const g of product.modifierGroups) {
    const selected = byGroup.get(g.id) ?? [];
    if (g.required && selected.length < Math.max(1, g.minSelections)) {
      return {
        ok: false,
        warning: {
          code: "INVALID_MODIFIERS",
          productId: product.id,
          message: `Please choose options for “${g.name}”.`,
        },
      };
    }
    if (selected.length > g.maxSelections) {
      return {
        ok: false,
        warning: {
          code: "INVALID_MODIFIERS",
          productId: product.id,
          message: `Too many options selected for “${g.name}”.`,
        },
      };
    }
  }

  const labels: string[] = [];
  let extra = 0;
  for (const id of ids) {
    const opt = optionMap.get(id)!;
    labels.push(opt.name);
    extra += opt.price;
  }
  return { ok: true, labels, extra };
}

function resolveUnitPrice(
  product: StorefrontCatalogProduct,
  variantId?: string,
  modifierExtra = 0,
): { unitPrice: number; variantTitle?: string; warning?: StoreCartWarning } {
  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      return {
        unitPrice: 0,
        warning: {
          code: "INVALID_VARIANT",
          productId: product.id,
          message: `Variant no longer available for “${product.title}”.`,
        },
      };
    }
    if (variant.soldOut || !variant.canAddToCart) {
      return {
        unitPrice: 0,
        warning: {
          code: "SOLD_OUT",
          productId: product.id,
          message: `“${variant.title}” is sold out.`,
        },
      };
    }
    return {
      unitPrice: Math.round((variant.price + modifierExtra) * 100) / 100,
      variantTitle: variant.title,
    };
  }
  return {
    unitPrice: Math.round((product.price + modifierExtra) * 100) / 100,
  };
}

function capQuantity(
  product: StorefrontCatalogProduct,
  quantity: number,
): { quantity: number; warning?: StoreCartWarning } {
  let q = quantity;
  if (product.maxStorefrontQuantity != null && q > product.maxStorefrontQuantity) {
    q = product.maxStorefrontQuantity;
    return {
      quantity: q,
      warning: {
        code: "QUANTITY_CAPPED",
        productId: product.id,
        message: `Quantity capped to ${product.maxStorefrontQuantity} for “${product.title}”.`,
      },
    };
  }
  if (product.availableQty != null && q > product.availableQty) {
    q = product.availableQty;
    return {
      quantity: q,
      warning: {
        code: "QUANTITY_CAPPED",
        productId: product.id,
        message: `Only ${product.availableQty} left for “${product.title}”.`,
      },
    };
  }
  if (q <= 0 || !product.canAddToCart) {
    return {
      quantity: 0,
      warning: {
        code: "SOLD_OUT",
        productId: product.id,
        message: `“${product.title}” is sold out.`,
      },
    };
  }
  return { quantity: q };
}

export function priceCartLines(
  lines: StoreCartLine[],
  catalog: StorefrontMenuCatalog,
  opts?: { clientPriceVersion?: string },
): { cart: StoreCartPayload; warnings: StoreCartWarning[] } {
  const warnings: StoreCartWarning[] = [];

  if (opts?.clientPriceVersion && opts.clientPriceVersion !== catalog.priceVersion) {
    warnings.push({
      code: "MENU_CHANGED",
      message: "Menu prices or availability changed — your cart was refreshed.",
    });
  }

  const priced: StoreCartLinePriced[] = [];
  let subtotal = 0;
  let itemCount = 0;

  for (const line of lines) {
    const p = catalog.products.find((x) => x.id === line.productId);
    if (!p) {
      warnings.push({
        code: "NOT_ON_MENU",
        productId: line.productId,
        message: "An item is no longer on the menu.",
      });
      continue;
    }

    const modCheck = validateModifiers(p, line.modifierOptionIds ?? []);
    if (!modCheck.ok) {
      warnings.push(modCheck.warning);
      continue;
    }

    const priceRes = resolveUnitPrice(p, line.variantId, modCheck.extra);
    if (priceRes.warning) {
      warnings.push(priceRes.warning);
      continue;
    }

    const capped = capQuantity(p, line.quantity);
    if (capped.warning) warnings.push(capped.warning);
    if (capped.quantity <= 0) continue;

    if (p.soldOut && !line.variantId) {
      warnings.push({
        code: "SOLD_OUT",
        productId: p.id,
        lineKey: cartLineKey(line),
        message: `“${p.title}” is sold out.`,
      });
      continue;
    }

    const lineTotal = Math.round(priceRes.unitPrice * capped.quantity * 100) / 100;
    const key = cartLineKey(line);
    subtotal += lineTotal;
    itemCount += capped.quantity;
    priced.push({
      productId: p.id,
      variantId: line.variantId,
      modifierOptionIds: normalizeModifierIds(line.modifierOptionIds),
      quantity: capped.quantity,
      lineKey: key,
      unitPrice: priceRes.unitPrice,
      lineTotal,
      title: p.title,
      variantTitle: priceRes.variantTitle,
      modifierLabels: modCheck.labels.length ? modCheck.labels : undefined,
      soldOut: p.soldOut,
      canAddToCart: p.canAddToCart,
    });
  }

  return {
    cart: {
      menuId: catalog.menuId,
      priceVersion: catalog.priceVersion,
      currency: catalog.currency,
      lines: priced,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount,
    },
    warnings,
  };
}

export async function resolveStorefrontCart(input: {
  storeSlug: string;
  rawLines: StoreCartLine[];
  clientPriceVersion?: string;
}): Promise<
  | { ok: false; error: string; status: number }
  | { ok: true; catalog: StorefrontMenuCatalog; cart: StoreCartPayload; warnings: StoreCartWarning[] }
> {
  const catalog = await loadPublishedStorefrontCatalog(input.storeSlug);
  if (!catalog) {
    return { ok: false, error: "Storefront not found.", status: 404 };
  }

  const { cart, warnings } = priceCartLines(input.rawLines, catalog, {
    clientPriceVersion: input.clientPriceVersion,
  });
  return { ok: true, catalog, cart, warnings };
}

export function sealCartFromPayload(
  catalog: StorefrontMenuCatalog,
  cart: StoreCartPayload,
): Omit<ServerCartPayload, "exp"> {
  const lines: StoreCartLine[] = cart.lines.map((l) => ({
    productId: l.productId,
    variantId: l.variantId,
    modifierOptionIds: l.modifierOptionIds,
    quantity: l.quantity,
  }));
  return {
    storefrontId: catalog.storefrontId,
    storeSlug: catalog.storeSlug,
    menuId: catalog.menuId,
    priceVersion: catalog.priceVersion,
    lines,
    version: catalog.priceVersion,
  };
}

export async function syncCartFromRecord(input: {
  storeSlug: string;
  record: Record<string, number>;
  cartLines?: StoreCartLine[];
  merge: boolean;
  existing?: StoreCartLine[];
  clientPriceVersion?: string;
}) {
  const catalog = await loadPublishedStorefrontCatalog(input.storeSlug);
  if (!catalog) {
    return { ok: false as const, error: "Storefront not found.", status: 404 };
  }

  let merged: StoreCartLine[];
  if (input.cartLines?.length) {
    const map = new Map<string, StoreCartLine>();
    const seed = input.merge ? (input.existing ?? []) : [];
    for (const l of seed) map.set(cartLineKey(l), l);
    for (const l of input.cartLines) {
      const key = cartLineKey(l);
      const prev = map.get(key);
      map.set(key, {
        ...l,
        quantity: input.merge ? (prev?.quantity ?? 0) + l.quantity : l.quantity,
      });
    }
    merged = [...map.values()].filter((l) => l.quantity > 0);
  } else {
    merged = mergeCartLines(input.existing ?? [], input.record, input.merge ? "merge" : "replace");
  }

  const { cart, warnings } = priceCartLines(merged, catalog, {
    clientPriceVersion: input.clientPriceVersion,
  });
  return { ok: true as const, catalog, cart, warnings };
}

export { loadPublishedStorefrontCatalog, buildStorefrontMenuCatalog };
