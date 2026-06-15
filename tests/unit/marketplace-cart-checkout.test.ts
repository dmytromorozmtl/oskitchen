import { describe, expect, it } from "vitest";

import {
  cartSubtotal,
  parseCartPayload,
  type MarketplaceCartItem,
} from "@/services/marketplace/cart-service";
import { approvalCheck, splitByVendor } from "@/services/marketplace/checkout-service";

const sampleItems: MarketplaceCartItem[] = [
  {
    productId: "p1",
    slug: "gloves",
    name: "Gloves",
    sku: "GL-1",
    vendorId: "v1",
    vendorName: "Vendor A",
    quantity: 2,
    unitPrice: 10,
    currency: "USD",
  },
  {
    productId: "p2",
    slug: "film",
    name: "Film",
    sku: "FM-1",
    vendorId: "v1",
    vendorName: "Vendor A",
    quantity: 1,
    unitPrice: 15,
    currency: "USD",
  },
  {
    productId: "p3",
    slug: "oil",
    name: "Oil",
    sku: "OL-1",
    vendorId: "v2",
    vendorName: "Vendor B",
    quantity: 4,
    unitPrice: 8,
    currency: "USD",
  },
];

describe("marketplace cart service", () => {
  it("parses legacy array cart payloads", () => {
    const payload = parseCartPayload(sampleItems);
    expect(payload.items).toHaveLength(3);
    expect(payload.savedTemplates).toEqual([]);
  });

  it("calculates subtotal", () => {
    expect(cartSubtotal(sampleItems)).toBe(67);
  });
});

describe("marketplace checkout service", () => {
  it("splits cart lines by vendor", () => {
    const groups = splitByVendor(sampleItems);
    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.vendorId === "v1")?.subtotal).toBe(35);
    expect(groups.find((group) => group.vendorId === "v2")?.subtotal).toBe(32);
  });

  it("requires approval above manager limit", () => {
    expect(approvalCheck(2400)).toBe(false);
    expect(approvalCheck(2600)).toBe(true);
  });
});
