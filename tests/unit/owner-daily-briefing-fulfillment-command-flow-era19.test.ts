import { describe, expect, it } from "vitest";

import {
  BRIEFING_FULFILLMENT_COMMAND_FLOW_TILE_ID,
  buildBriefingFulfillmentCommandFlowTile,
  buildOwnerDailyBriefingFulfillmentCommandFlowActions,
  enrichBriefingFulfillmentCommandFlowPackTiles,
  mergeBriefingFulfillmentCommandFlowTopActions,
  OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_POLICY_ID,
  summarizeFulfillmentCommandFlow,
  type FulfillmentCommandFlowBriefingInput,
} from "@/lib/briefing/owner-daily-briefing-fulfillment-command-flow-era19";
import { BRIEFING_KDS_PRIORITY_LANE_HREF } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { buildPackingQcClarityHref } from "@/lib/packing/packing-qc-clarity-era19";

const allergenPrep = {
  id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
  status: "PREPARING",
  elapsedSeconds: 960,
  createdAt: "2026-05-28T10:00:00.000Z",
  customerName: "Alex",
  hasAllergenConflict: true,
};

function baseInput(
  overrides: Partial<FulfillmentCommandFlowBriefingInput> = {},
): FulfillmentCommandFlowBriefingInput {
  return {
    kdsOrders: [allergenPrep],
    productionCalendarOverdue: 0,
    productionCalendarDueToday: 0,
    packingQueueOpen: 2,
    productionWorkOpen: 1,
    activeOrders: 4,
    ordersToday: 6,
    blockedOrdersApprox: 0,
    posKitchenQueueToday: 2,
    ...overrides,
  };
}

describe("owner-daily-briefing-fulfillment-command-flow-era19", () => {
  it("locks era19 fulfillment command flow policy id", () => {
    expect(OWNER_DAILY_BRIEFING_FULFILLMENT_COMMAND_FLOW_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-fulfillment-command-flow-v1",
    );
  });

  it("activates when orders, kitchen, and packing are all under pressure", () => {
    const flow = summarizeFulfillmentCommandFlow(baseInput());
    expect(flow).not.toBeNull();
    expect(flow?.bottleneck).toBe("kds");
  });

  it("prioritizes stuck orders as the bottleneck", () => {
    const flow = summarizeFulfillmentCommandFlow(
      baseInput({ blockedOrdersApprox: 3 }),
    );
    expect(flow?.bottleneck).toBe("stuck_orders");
    expect(flow?.bottleneckHref).toBe("/dashboard/order-hub");
  });

  it("builds command flow tile after orders-today", () => {
    const tiles = enrichBriefingFulfillmentCommandFlowPackTiles(
      [
        {
          id: "orders-today",
          category: "orders",
          label: "Orders today",
          value: "6",
          detail: "4 in active pipeline",
          href: "/dashboard/orders",
          availability: "available",
          tone: "neutral",
          priority: 10,
          whyItMatters: "See today's intake.",
          linkState: "operational",
        },
        {
          id: "kds-pressure",
          category: "kitchen",
          label: "KDS pressure",
          value: "3",
          detail: "Kitchen queue is active.",
          href: "/dashboard/kitchen",
          availability: "available",
          tone: "attention",
          priority: 3,
          whyItMatters: "Kitchen queue depth predicts delays.",
          linkState: "blocked",
        },
        {
          id: "packing-status",
          category: "packing",
          label: "Packing queue",
          value: "2",
          detail: "Open pack jobs.",
          href: "/dashboard/packing",
          availability: "available",
          tone: "attention",
          priority: 12,
          whyItMatters: "Outbound queue delays handoff.",
          linkState: "operational",
        },
      ],
      baseInput(),
    );

    const ordersIndex = tiles.findIndex((tile) => tile.id === "orders-today");
    expect(tiles[ordersIndex + 1]?.id).toBe(BRIEFING_FULFILLMENT_COMMAND_FLOW_TILE_ID);
    expect(tiles.find((tile) => tile.id === "packing-status")?.href).toBe(
      buildPackingQcClarityHref(),
    );
    expect(tiles.find((tile) => tile.id === "kds-pressure")?.href).toBe(
      BRIEFING_KDS_PRIORITY_LANE_HREF,
    );
  });

  it("builds owner ranked action for the bottleneck stage", () => {
    const tile = buildBriefingFulfillmentCommandFlowTile(
      baseInput({ blockedOrdersApprox: 0, packingQueueOpen: 3, productionWorkOpen: 0, posKitchenQueueToday: 0, kdsOrders: [] }),
    );
    expect(tile).toBeNull();

    const packingOnly = summarizeFulfillmentCommandFlow(
      baseInput({
        activeOrders: 0,
        ordersToday: 0,
        packingQueueOpen: 0,
      }),
    );
    expect(packingOnly).toBeNull();

    const [action] = buildOwnerDailyBriefingFulfillmentCommandFlowActions(
      baseInput({ blockedOrdersApprox: 2 }),
      "owner",
    );
    expect(action?.id).toBe("fulfillment-command-flow");
    expect(action?.href).toBe("/dashboard/order-hub");
    expect(action?.ctaLabel).toBe("Open Order Hub");
  });

  it("prioritizes fulfillment action ahead of generic monitor actions", () => {
    const merged = mergeBriefingFulfillmentCommandFlowTopActions(
      [
        {
          id: "monitor-order-hub",
          title: "Monitor pipeline",
          reason: "3 active orders",
          severity: "low",
          ownerRole: "manager",
          href: "/dashboard/order-hub",
          status: "monitor",
          unblockCondition: "Clear queue",
          priority: 25,
          ctaLabel: "Open",
          tone: "normal",
        },
      ],
      buildOwnerDailyBriefingFulfillmentCommandFlowActions(baseInput(), "manager"),
    );

    expect(merged[0]?.id).toBe("fulfillment-command-flow");
  });
});
