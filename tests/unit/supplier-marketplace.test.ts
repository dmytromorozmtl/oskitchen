import { describe, expect, it } from "vitest";

import {
  buildSupplierLaneCatalogHref,
  buildSupplierLaneSnapshot,
  buildSupplierMarketplaceDashboard,
} from "@/lib/marketplace/supplier-marketplace-builders";
import {
  SUPPLIER_LANE_CATEGORY_SLUGS,
  SUPPLIER_MARKETPLACE_LANES,
  SUPPLIER_MARKETPLACE_PATH,
  SUPPLIER_MARKETPLACE_POLICY_ID,
  SUPPLIER_MARKETPLACE_SERVICE,
} from "@/lib/marketplace/supplier-marketplace-policy";

describe("Supplier Marketplace", () => {
  it("locks policy constants", () => {
    expect(SUPPLIER_MARKETPLACE_POLICY_ID).toBe("supplier-marketplace-v1");
    expect(SUPPLIER_MARKETPLACE_SERVICE).toBe("services/marketplace/supplier-marketplace-service.ts");
    expect(SUPPLIER_MARKETPLACE_PATH).toBe("/dashboard/marketplace");
    expect(SUPPLIER_MARKETPLACE_LANES).toEqual(["food", "packaging", "equipment"]);
  });

  it("maps lanes to procurement category slugs", () => {
    expect(SUPPLIER_LANE_CATEGORY_SLUGS.food).toContain("dry-goods");
    expect(SUPPLIER_LANE_CATEGORY_SLUGS.packaging).toContain("packaging-disposables");
    expect(SUPPLIER_LANE_CATEGORY_SLUGS.equipment).toContain("equipment");
  });

  it("builds lane catalog hrefs", () => {
    expect(buildSupplierLaneCatalogHref("food")).toBe("/dashboard/marketplace/catalog?category=dry-goods");
    expect(buildSupplierLaneCatalogHref("packaging")).toBe(
      "/dashboard/marketplace/catalog?category=packaging-disposables",
    );
    expect(buildSupplierLaneCatalogHref("equipment")).toBe(
      "/dashboard/marketplace/catalog?category=equipment",
    );
  });

  it("assembles supplier marketplace dashboard", () => {
    const lane = buildSupplierLaneSnapshot({
      lane: "packaging",
      productCount: 42,
      vendorCount: 6,
      topProducts: [
        {
          id: "p1",
          name: "Kraft takeout box",
          slug: "kraft-takeout-box",
          vendorName: "PackCo",
          basePrice: 24.5,
          currency: "USD",
          priceUnit: "PER_CASE",
          inStock: true,
        },
      ],
      oneClickReorder: {
        id: "packaging-o1",
        lane: "packaging",
        productId: "p1",
        productName: "Kraft takeout box",
        slug: "kraft-takeout-box",
        sku: "BOX-12",
        vendorId: "v1",
        vendorName: "PackCo",
        quantity: 4,
        unitPrice: 24.5,
        currency: "USD",
        lastOrderedAtIso: "2026-06-01T12:00:00.000Z",
      },
    });

    const dashboard = buildSupplierMarketplaceDashboard({
      workspaceId: "ws-1",
      lanes: [lane],
    });

    expect(dashboard.policyId).toBe(SUPPLIER_MARKETPLACE_POLICY_ID);
    expect(dashboard.basePath).toBe(SUPPLIER_MARKETPLACE_PATH);
    expect(dashboard.summary.totalSkus).toBe(42);
    expect(dashboard.summary.lanesWithReorder).toBe(1);
    expect(dashboard.oneClickReorders).toHaveLength(1);
  });
});
