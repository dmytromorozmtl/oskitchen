import { describe, expect, it } from "vitest";

import {
  CROSS_CHANNEL_INVENTORY_PROVIDERS,
  CROSS_CHANNEL_INVENTORY_POLICY_ID,
} from "@/lib/inventory/cross-channel-inventory-settings";
import {
  applyCrossChannelConflictPlan,
  buildCrossChannelLevels,
  buildCrossChannelSyncSnapshot,
  computeAvailableQuantity,
  createCrossChannelReservation,
  detectCrossChannelConflicts,
  detectCrossChannelLowStockAlerts,
  extractDoorDashChannelQuantity,
  planCrossChannelRealtimeSync,
  releaseCrossChannelReservation,
  resolveCrossChannelConflict,
} from "@/services/inventory/cross-channel-inventory-sync";

describe("cross-channel inventory sync engine", () => {
  const masterByProduct = new Map([
    [
      "p-burger",
      { title: "Burger", sku: "BRG-1", quantity: 10, lowStockThreshold: 5 },
    ],
    [
      "p-fries",
      { title: "Fries", sku: "FRI-1", quantity: 3, lowStockThreshold: 5 },
    ],
  ]);

  const externalRows = [
    {
      connectionId: "c-shopify",
      provider: "SHOPIFY",
      externalProductId: "sp1",
      externalVariantId: "sv1",
      mappedProductId: "p-burger",
      title: "Burger",
      sku: "BRG-1",
      rawPayloadJson: { variant: { inventoryQuantity: 10 } },
    },
    {
      connectionId: "c-woo",
      provider: "WOOCOMMERCE",
      externalProductId: "wp2",
      externalVariantId: "",
      mappedProductId: "p-fries",
      title: "Fries",
      sku: "FRI-1",
      rawPayloadJson: { stock_quantity: 8 },
    },
    {
      connectionId: "c-dd",
      provider: "DOORDASH",
      externalProductId: "dd3",
      externalVariantId: "",
      mappedProductId: "p-burger",
      title: "Burger",
      sku: "BRG-1",
      rawPayloadJson: { quantity: 7 },
    },
  ];

  it("locks cross-channel inventory policy id", () => {
    expect(CROSS_CHANNEL_INVENTORY_POLICY_ID).toBe("critical-cross-channel-inventory-sync-v1");
    expect(CROSS_CHANNEL_INVENTORY_PROVIDERS).toEqual([
      "POS",
      "SHOPIFY",
      "WOOCOMMERCE",
      "DOORDASH",
    ]);
  });

  it("extracts DoorDash channel quantity from payload", () => {
    expect(extractDoorDashChannelQuantity({ quantity: 12 })).toBe(12);
    expect(extractDoorDashChannelQuantity({ in_stock: false })).toBe(0);
  });

  it("builds levels across POS and external channels", () => {
    const levels = buildCrossChannelLevels({
      masterByProduct,
      externalRows,
      reservations: [],
      lowStockThresholdDefault: 5,
    });
    const burger = levels.find((l) => l.productId === "p-burger");
    expect(burger?.channels.map((c) => c.provider)).toEqual(["POS", "SHOPIFY", "DOORDASH"]);
    expect(burger?.masterQuantity).toBe(10);
  });

  it("detects conflicts when channel quantity differs from master", () => {
    const levels = buildCrossChannelLevels({
      masterByProduct,
      externalRows,
      reservations: [],
      lowStockThresholdDefault: 5,
    });
    const conflicts = detectCrossChannelConflicts(levels);
    expect(conflicts.some((c) => c.channel.provider === "DOORDASH")).toBe(true);
    expect(conflicts.some((c) => c.channel.provider === "WOOCOMMERCE")).toBe(true);
  });

  it("computes available quantity with reservations", () => {
    const { reservations } = createCrossChannelReservation({
      reservations: [],
      productId: "p-burger",
      quantity: 2,
      channel: "POS",
    });
    const levels = buildCrossChannelLevels({
      masterByProduct,
      externalRows,
      reservations,
      lowStockThresholdDefault: 5,
    });
    const burger = levels.find((l) => l.productId === "p-burger");
    expect(burger?.reservedQuantity).toBe(2);
    expect(burger?.availableQuantity).toBe(8);
    expect(computeAvailableQuantity(10, 2)).toBe(8);
  });

  it("emits low-stock alerts when available is at or below threshold", () => {
    const levels = buildCrossChannelLevels({
      masterByProduct,
      externalRows,
      reservations: [],
      lowStockThresholdDefault: 5,
    });
    const alerts = detectCrossChannelLowStockAlerts(levels);
    expect(alerts.some((a) => a.productId === "p-fries")).toBe(true);
  });

  it("resolves conflicts by kitchen_wins strategy", () => {
    const levels = buildCrossChannelLevels({
      masterByProduct,
      externalRows,
      reservations: [],
      lowStockThresholdDefault: 5,
    });
    const conflict = detectCrossChannelConflicts(levels)[0]!;
    const outcome = resolveCrossChannelConflict(conflict, "kitchen_wins");
    expect(outcome.resolved).toBe(true);
    expect(outcome.channelQuantity).toBe(conflict.masterQuantity);

    const plan = applyCrossChannelConflictPlan({
      conflicts: [conflict],
      strategy: "kitchen_wins",
    });
    expect(plan.resolved).toBe(1);
  });

  it("plans realtime push when auto sync enabled and no manual conflicts", () => {
    const levels = buildCrossChannelLevels({
      masterByProduct: new Map([
        ["p-burger", { title: "Burger", sku: "BRG-1", quantity: 10, lowStockThreshold: 5 }],
      ]),
      externalRows: [externalRows[0]!],
      reservations: [],
      lowStockThresholdDefault: 5,
    });
    const plan = planCrossChannelRealtimeSync({
      level: levels[0]!,
      settings: { autoPushOnChange: true, conflictResolution: "kitchen_wins" },
      reason: "inventory_change",
    });
    expect(plan?.pushTargets).toHaveLength(1);
    expect(plan?.pushTargets[0]?.provider).toBe("SHOPIFY");
  });

  it("builds cross-channel snapshot with notes", () => {
    const levels = buildCrossChannelLevels({
      masterByProduct,
      externalRows,
      reservations: [],
      lowStockThresholdDefault: 5,
    });
    const snapshot = buildCrossChannelSyncSnapshot({ levels, reservations: [] });
    expect(snapshot.conflicts.length).toBeGreaterThan(0);
    expect(snapshot.lowStockAlerts.length).toBeGreaterThan(0);
    expect(snapshot.notes[0]).toContain("Cross-channel sync");
  });

  it("releases reservations by id", () => {
    const { reservations, reservation } = createCrossChannelReservation({
      reservations: [],
      productId: "p-burger",
      quantity: 1,
      channel: "SHOPIFY",
    });
    const next = releaseCrossChannelReservation(reservations, reservation.id);
    expect(next).toHaveLength(0);
  });
});
