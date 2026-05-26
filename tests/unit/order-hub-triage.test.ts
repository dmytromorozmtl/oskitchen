import { describe, expect, it } from "vitest";

import type { OrderHubPageData } from "@/services/order-hub/order-hub-service";
import { ORDER_HUB_TABS } from "@/lib/order-hub/order-hub-status";
import {
  computeOrderHubTabCounts,
  filterExternalOrders,
  filterInternalOrders,
  internalOrderMissingCustomerInfo,
  internalOrderMissingFulfillmentInfo,
} from "@/services/order-hub/order-triage-service";

type Internal = OrderHubPageData["internalOrders"][number];

function baseOrder(over: Partial<Internal>): Internal {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    userId: "00000000-0000-0000-0000-000000000002",
    brandId: null,
    locationId: null,
    customerId: null,
    customerName: "Jane",
    customerEmail: "jane@example.com",
    customerPhone: null,
    total: 10 as unknown as Internal["total"],
    status: "PENDING",
    statusDetail: null,
    orderType: "PREORDER",
    paymentMode: null,
    paymentStatus: null,
    creationSource: "STOREFRONT",
    fulfillmentType: "PICKUP",
    fulfillmentDetail: "PICKUP",
    pickupDate: null,
    fulfillmentWindowStart: null,
    fulfillmentWindowEnd: null,
    pickupLocationId: null,
    deliveryAddressJson: null,
    notes: null,
    kitchenNotes: null,
    packingNotes: null,
    deliveryNotesExt: null,
    allergyNotes: null,
    dietaryNotes: null,
    subtotal: null,
    taxAmount: null,
    feesAmount: null,
    discountAmount: null,
    channelProvider: null,
    externalOrderIdExt: null,
    sourceMetadataJson: null,
    publicLookupToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    channelImportBatchId: null,
    channelTraceJson: null,
    isChannelTestOrder: false,
    channelImportBatch: null,
    importedFromExternal: null,
    ...over,
  } as Internal;
}

describe("order hub triage", () => {
  it("POS walk-in placeholder is not missing customer info", () => {
    const o = baseOrder({
      creationSource: "POS",
      orderType: "POS_SALE",
      customerName: "Walk-in customer",
      customerEmail: "guest@local.kitchenos.invalid",
      customerPhone: null,
    });
    expect(internalOrderMissingCustomerInfo(o)).toBe(false);
  });

  it("storefront preorder without pickup is missing fulfillment info", () => {
    const o = baseOrder({
      orderType: "PREORDER",
      fulfillmentType: "PICKUP",
      pickupDate: null,
    });
    expect(internalOrderMissingFulfillmentInfo(o)).toBe(true);
  });

  it("failed tab includes import batch failed", () => {
    const o = baseOrder({
      status: "CONFIRMED",
      channelImportBatch: { id: "b1", sourceType: "SYNC", status: "FAILED" },
    });
    const rows = filterInternalOrders("failed", [o]);
    expect(rows).toHaveLength(1);
  });

  it("filterExternalOrders returns pending weak-contact rows for missing customer tab", () => {
    const ext = [
      {
        id: "e1",
        userId: "u1",
        connectionId: null,
        provider: "SHOPIFY" as const,
        externalOrderId: "x",
        externalOrderNumber: null,
        sourceStatus: null,
        normalizedStatus: null,
        customerName: null,
        customerEmail: null,
        customerPhone: null,
        subtotal: null,
        tax: null,
        deliveryFee: null,
        total: null,
        currency: null,
        fulfillmentType: "PICKUP" as const,
        pickupTime: new Date(),
        deliveryTime: null,
        deliveryAddressJson: null,
        rawPayloadJson: {},
        importedOrderId: null,
        channelImportBatchId: null,
        syncStatus: "PENDING" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        channelImportBatch: null,
      },
    ];
    expect(filterExternalOrders("missing_customer_info", ext as OrderHubPageData["externalOrders"])).toHaveLength(1);
  });

  it("computeOrderHubTabCounts returns one entry per tab and zeros for empty hub", () => {
    const data: OrderHubPageData = { internalOrders: [], externalOrders: [], mappingBlockedCount: 0 };
    const counts = computeOrderHubTabCounts(data);
    expect(counts).toHaveLength(ORDER_HUB_TABS.length);
    expect(counts.every((c) => c.total === 0)).toBe(true);
  });

  it("computeOrderHubTabCounts splits internal vs external for needs_review", () => {
    const ext = [
      {
        id: "e1",
        userId: "u1",
        connectionId: null,
        provider: "SHOPIFY" as const,
        externalOrderId: "x",
        externalOrderNumber: null,
        sourceStatus: null,
        normalizedStatus: null,
        customerName: "Ext",
        customerEmail: "e@example.com",
        customerPhone: null,
        subtotal: null,
        tax: null,
        deliveryFee: null,
        total: null,
        currency: null,
        fulfillmentType: "PICKUP" as const,
        pickupTime: new Date(),
        deliveryTime: null,
        deliveryAddressJson: null,
        rawPayloadJson: {},
        importedOrderId: null,
        channelImportBatchId: null,
        syncStatus: "PENDING" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        channelImportBatch: null,
      },
    ];
    const data: OrderHubPageData = {
      internalOrders: [baseOrder({ status: "PENDING" })],
      externalOrders: ext as OrderHubPageData["externalOrders"],
      mappingBlockedCount: 0,
    };
    const row = computeOrderHubTabCounts(data).find((c) => c.id === "needs_review");
    expect(row?.internal).toBe(1);
    expect(row?.external).toBe(1);
    expect(row?.total).toBe(2);
  });
});
