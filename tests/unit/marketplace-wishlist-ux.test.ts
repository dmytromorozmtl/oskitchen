import { readFileSync } from "node:fs";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MARKETPLACE_WISHLIST_KEY,
  addMarketplaceWishlistSlug,
  isMarketplaceWishlistSlug,
  readMarketplaceWishlistSlugs,
  removeMarketplaceWishlistSlug,
  toggleMarketplaceWishlistSlug,
  writeMarketplaceWishlistSlugs,
} from "@/lib/marketplace/wishlist";

const WISHLIST_BUTTON_PATH = join(process.cwd(), "components/marketplace/wishlist-button.tsx");
const WISHLIST_PAGE_PATH = join(process.cwd(), "components/marketplace/wishlist-page.tsx");
const PRODUCT_DETAIL_PATH = join(
  process.cwd(),
  "components/marketplace/marketplace-product-detail-client.tsx",
);
const CATALOG_CARD_PATH = join(process.cwd(), "components/marketplace/marketplace-catalog-product-card.tsx");
const ROUTE_PATH = join(process.cwd(), "app/dashboard/marketplace/wishlist/page.tsx");

describe("marketplace wishlist UX", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    const storage = {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        for (const key of Object.keys(store)) delete store[key];
      },
    };
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("persists slug toggles in localStorage", () => {
    expect(readMarketplaceWishlistSlugs()).toEqual([]);
    addMarketplaceWishlistSlug("family-meal-box");
    expect(isMarketplaceWishlistSlug("family-meal-box")).toBe(true);
    expect(toggleMarketplaceWishlistSlug("family-meal-box")).toEqual({
      wishlisted: false,
      slugs: [],
    });
    expect(window.localStorage.getItem(MARKETPLACE_WISHLIST_KEY)).toBe("[]");
    expect(removeMarketplaceWishlistSlug("missing")).toEqual([]);
  });

  it("ships WishlistButton with icon and labeled variants", () => {
    const source = readFileSync(WISHLIST_BUTTON_PATH, "utf8");
    expect(source).toContain("export function WishlistButton");
    expect(source).toContain('variant?: "outline" | "ghost" | "icon"');
    expect(source).toContain("toggleMarketplaceWishlistSlug");
    expect(source).toContain('aria-pressed={wishlisted}');
    expect(source).toContain('data-testid={`wishlist-button-${slug}`}');
  });

  it("ships WishlistPage and wires it through catalog, detail, and route", () => {
    const pageSource = readFileSync(WISHLIST_PAGE_PATH, "utf8");
    const routeSource = readFileSync(ROUTE_PATH, "utf8");
    const detailSource = readFileSync(PRODUCT_DETAIL_PATH, "utf8");
    const cardSource = readFileSync(CATALOG_CARD_PATH, "utf8");

    expect(pageSource).toContain('data-testid="marketplace-wishlist-page"');
    expect(pageSource).toContain("MarketplaceWishlistClient");
    expect(routeSource).toContain("WishlistPage");
    expect(detailSource).toContain("WishlistButton");
    expect(detailSource).not.toContain("toggleWishlist");
    expect(cardSource).toContain('variant="icon"');
  });
});
