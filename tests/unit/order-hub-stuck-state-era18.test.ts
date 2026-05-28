import { describe, expect, it } from "vitest";

import {
  ORDER_HUB_STUCK_STATE_ERA18_POLICY_ID,
  ORDER_HUB_STUCK_STATE_ERA18_PROOF_STATUS,
} from "@/lib/order-hub/order-hub-stuck-state-era18-policy";
import {
  pickOrderHubAttentionItems,
  resolveInternalOrderHubRowNextAction,
} from "@/lib/order-hub/order-hub-stuck-state-era18";
import type { OrderHubPageData } from "@/services/order-hub/order-hub-service";
import { ORDER_HUB_TABS } from "@/lib/order-hub/order-hub-status";

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

function exactCounts(totals: Partial<Record<string, number>>) {
  return ORDER_HUB_TABS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    internal: totals[tab.id] ?? 0,
    external: 0,
    total: totals[tab.id] ?? 0,
  }));
}

describe("order hub stuck state era18", () => {
  it("locks era18 order hub stuck state policy id", () => {
    expect(ORDER_HUB_STUCK_STATE_ERA18_POLICY_ID).toBe("era18-order-hub-stuck-state-v1");
    expect(ORDER_HUB_STUCK_STATE_ERA18_PROOF_STATUS).toBe("order_hub_stuck_state_wired");
  });

  it("prioritizes mapping conflicts over sync failures", () => {
    const items = pickOrderHubAttentionItems({
      mappingBlockedCount: 2,
      exactTabCounts: exactCounts({ failed: 5, needs_review: 3 }),
    });
    expect(items[0]?.id).toBe("mapping-conflicts");
    expect(items[1]?.id).toBe("sync-failed");
  });

  it("returns empty attention strip when queue is clear", () => {
    expect(
      pickOrderHubAttentionItems({
        mappingBlockedCount: 0,
        exactTabCounts: exactCounts({}),
      }),
    ).toEqual([]);
  });

  it("surfaces fulfillment fix before status progression", () => {
    const o = baseOrder({
      status: "CONFIRMED",
      orderType: "PREORDER",
      pickupDate: null,
    });
    expect(resolveInternalOrderHubRowNextAction(o)?.label).toBe("Set service date");
  });

  it("suggests production handoff when prerequisites are satisfied", () => {
    const o = baseOrder({
      status: "CONFIRMED",
      orderType: "POS_SALE",
      creationSource: "POS",
      pickupDate: new Date(),
    });
    expect(resolveInternalOrderHubRowNextAction(o)?.label).toBe("Send to production");
  });

  it("flags sync failure before status hints", () => {
    const o = baseOrder({
      status: "CONFIRMED",
      channelImportBatch: { id: "b1", sourceType: "WEBHOOK", status: "FAILED" },
    });
    expect(resolveInternalOrderHubRowNextAction(o)?.label).toBe("Fix channel sync");
  });
});
