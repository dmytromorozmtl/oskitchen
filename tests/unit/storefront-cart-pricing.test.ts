import { describe, expect, it } from "vitest";

import type { StorefrontCatalogProduct, StorefrontMenuCatalog } from "@/lib/storefront/catalog-types";
import { computeMenuPriceVersion } from "@/lib/storefront/menu-price-version";
import { computeCheckoutTotals } from "@/lib/storefront/checkout-totals";
import { priceCartLines } from "@/services/storefront/storefront-cart-service";

function product(overrides: Partial<StorefrontCatalogProduct> & { id: string; price: number }): StorefrontCatalogProduct {
  return {
    id: overrides.id,
    publicSlug: overrides.publicSlug ?? null,
    title: overrides.title ?? overrides.id,
    description: null,
    price: overrides.price,
    preparedDate: "2026-05-17",
    image: null,
    maxStorefrontQuantity: overrides.maxStorefrontQuantity ?? null,
    soldOut: overrides.soldOut ?? false,
    availableQty: overrides.availableQty ?? null,
    canAddToCart: overrides.canAddToCart ?? !overrides.soldOut,
    variants: overrides.variants ?? [],
    modifierGroups: overrides.modifierGroups ?? [],
  };
}

function catalog(products: StorefrontCatalogProduct[]): StorefrontMenuCatalog {
  return {
    storefrontId: "sf-1",
    storeSlug: "hello",
    menuId: "menu-1",
    currency: "CAD",
    priceVersion: computeMenuPriceVersion(products),
    products,
  };
}

describe("computeMenuPriceVersion", () => {
  it("changes when price or stock changes", () => {
    const a = [product({ id: "p1", price: 10 })];
    const b = [product({ id: "p1", price: 11 })];
    const c = [product({ id: "p1", price: 10, soldOut: true })];
    expect(computeMenuPriceVersion(a)).not.toBe(computeMenuPriceVersion(b));
    expect(computeMenuPriceVersion(a)).not.toBe(computeMenuPriceVersion(c));
    expect(computeMenuPriceVersion(a)).toBe(computeMenuPriceVersion([...a]));
  });
});

describe("priceCartLines", () => {
  it("prices lines from catalog and drops sold-out items", () => {
    const cat = catalog([
      product({ id: "a", price: 12.5, title: "Soup" }),
      product({ id: "b", price: 8, title: "Bread", soldOut: true, canAddToCart: false }),
    ]);
    const { cart, warnings } = priceCartLines(
      [
        { productId: "a", quantity: 2 },
        { productId: "b", quantity: 1 },
      ],
      cat,
    );
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.lineTotal).toBe(25);
    expect(cart.subtotal).toBe(25);
    expect(cart.itemCount).toBe(2);
    expect(warnings.some((w) => w.code === "SOLD_OUT")).toBe(true);
  });

  it("warns when client price version is stale", () => {
    const cat = catalog([product({ id: "a", price: 5 })]);
    const { warnings } = priceCartLines([{ productId: "a", quantity: 1 }], cat, {
      clientPriceVersion: "stale-version",
    });
    expect(warnings.some((w) => w.code === "MENU_CHANGED")).toBe(true);
  });

  it("caps quantity to availableQty", () => {
    const cat = catalog([product({ id: "a", price: 10, availableQty: 2 })]);
    const { cart, warnings } = priceCartLines([{ productId: "a", quantity: 5 }], cat);
    expect(cart.lines[0]?.quantity).toBe(2);
    expect(cart.subtotal).toBe(20);
    expect(warnings.some((w) => w.code === "QUANTITY_CAPPED")).toBe(true);
  });
});

describe("computeCheckoutTotals", () => {
  it("builds tax, tip, delivery line items", () => {
    const totals = computeCheckoutTotals({
      subtotal: 100,
      deliveryFee: 5,
      discountAmount: 10,
      taxRatePercent: 13,
      taxIncludedInPrices: false,
      taxDisplayName: "HST",
      tipAmount: 9,
      depositAmount: 0,
    });
    expect(totals.tax).toBe(11.7);
    expect(totals.total).toBe(115.7);
    expect(totals.lines.find((l) => l.key === "tax")?.label).toBe("HST");
    expect(totals.lines.find((l) => l.key === "tip")?.amount).toBe(9);
  });
});
