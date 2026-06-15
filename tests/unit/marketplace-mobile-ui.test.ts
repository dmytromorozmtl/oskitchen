import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  loadOfflineCatalogProducts,
  OFFLINE_CATALOG_STORAGE_KEY,
  saveOfflineCatalogProducts,
} from "@/lib/marketplace/mobile-ui";

describe("marketplace mobile offline catalog cache", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: {
        store: {} as Record<string, string>,
        getItem(key: string) {
          return this.store[key] ?? null;
        },
        setItem(key: string, value: string) {
          this.store[key] = value;
        },
      },
      navigator: { onLine: true },
    });
  });

  it("persists and loads catalog products", () => {
    saveOfflineCatalogProducts([
      {
        id: "p1",
        slug: "olive-oil",
        name: "Olive oil",
        vendorName: "Acme Foods",
        basePrice: 12.5,
        currency: "USD",
        cachedAt: "2026-06-01T00:00:00.000Z",
      },
    ]);

    const loaded = loadOfflineCatalogProducts();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.slug).toBe("olive-oil");
    expect(window.localStorage.getItem(OFFLINE_CATALOG_STORAGE_KEY)).toContain("olive-oil");
  });

  it("returns empty array when cache is missing or invalid", () => {
    expect(loadOfflineCatalogProducts()).toEqual([]);
    window.localStorage.setItem(OFFLINE_CATALOG_STORAGE_KEY, "{bad json");
    expect(loadOfflineCatalogProducts()).toEqual([]);
  });
});
