import { describe, expect, it } from "vitest";

import { buildVendorPackingSlipHtml } from "@/services/marketplace/vendor-orders-service";
import type { VendorOrderDetail } from "@/services/marketplace/vendor-orders-service";

const sampleOrder: VendorOrderDetail = {
  id: "order-1",
  poNumber: "PO-1001",
  status: "PROCESSING",
  buyer: { workspaceId: "ws-1", name: "Demo Kitchen" },
  subtotal: 100,
  deliveryFee: 10,
  total: 110,
  currency: "USD",
  paymentMethod: "CARD",
  notes: null,
  deliveryAddress: { line1: "123 Main St", city: "Austin", region: "TX", postalCode: "78701", country: "US" },
  requestedDeliveryDate: null,
  confirmedDeliveryDate: null,
  trackingNumber: "TRK123",
  createdAt: new Date("2026-06-01").toISOString(),
  updatedAt: new Date("2026-06-01").toISOString(),
  items: [
    {
      id: "line-1",
      productId: "prod-1",
      productName: "Nitrile Gloves",
      sku: "GL-NIT-L",
      quantity: 5,
      unitPrice: 20,
      total: 100,
    },
  ],
  timeline: [],
};

describe("vendor orders service", () => {
  it("builds packing slip html with buyer and sku rows", () => {
    const html = buildVendorPackingSlipHtml(sampleOrder, "Supply Co");
    expect(html).toContain("Packing slip");
    expect(html).toContain("Demo Kitchen");
    expect(html).toContain("GL-NIT-L");
    expect(html).toContain("TRK123");
  });
});
