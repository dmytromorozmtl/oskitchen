import { describe, expect, it } from "vitest";

import {
  MARKETPLACE_CATALOG_CHECKOUT_VENDOR_ORDER_E2E_POLICY_ID,
  MARKETPLACE_VENDOR_ORDER_MANAGE_LABEL,
  VENDOR_ORDERS_PATH,
  buyerOrderPath,
  vendorOrderFanoutCount,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-catalog-checkout-vendor-order-e2e-policy";
import { splitByVendor } from "@/services/marketplace/checkout-service";

const sampleItems = [
  {
    productId: "p1",
    slug: "gloves",
    name: "Gloves",
    sku: "GL-1",
    vendorId: "v1",
    vendorName: "Vendor A",
    quantity: 2,
    unitPrice: 10,
    currency: "USD" as const,
  },
  {
    productId: "p2",
    slug: "oil",
    name: "Oil",
    sku: "OL-1",
    vendorId: "v2",
    vendorName: "Vendor B",
    quantity: 1,
    unitPrice: 8,
    currency: "USD" as const,
  },
];

describe("marketplace catalog → checkout → vendor order lifecycle (QA-17)", () => {
  it("exports E2E paths and vendor manage label", () => {
    expect(MARKETPLACE_CATALOG_CHECKOUT_VENDOR_ORDER_E2E_POLICY_ID).toBe(
      "marketplace-catalog-checkout-vendor-order-e2e-v1",
    );
    expect(VENDOR_ORDERS_PATH).toBe("/vendor/orders");
    expect(MARKETPLACE_VENDOR_ORDER_MANAGE_LABEL).toBe("Manage");
    expect(vendorOrderPath("abc")).toBe("/vendor/orders/abc");
    expect(buyerOrderPath("abc")).toBe("/dashboard/marketplace/orders/abc");
  });

  it("fans out one vendor order per vendor cart group", () => {
    const groups = splitByVendor(sampleItems);
    expect(groups).toHaveLength(2);
    expect(vendorOrderFanoutCount(groups.length)).toBe(2);
    expect(groups.map((group) => group.vendorId).sort()).toEqual(["v1", "v2"]);
  });

  it("single-vendor cart yields one vendor-facing order", () => {
    const groups = splitByVendor([sampleItems[0]!]);
    expect(vendorOrderFanoutCount(groups.length)).toBe(1);
  });
});
