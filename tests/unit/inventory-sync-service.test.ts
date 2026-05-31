import { describe, expect, it } from "vitest";

import {
  applyInventorySyncPlan,
  buildInventorySyncSnapshot,
  detectInventoryConflicts,
  extractShopifyChannelQuantity,
  extractWooChannelQuantity,
  resolveConflictQuantity,
} from "@/services/integrations/inventory-sync-service";

describe("inventory sync service", () => {
  const levels = [
    {
      connectionId: "c1",
      provider: "SHOPIFY" as const,
      externalProductId: "p1",
      externalVariantId: "v1",
      mappedProductId: "m1",
      productTitle: "Burger",
      sku: "BRG-1",
      kitchenQuantity: 10,
      channelQuantity: 10,
    },
    {
      connectionId: "c1",
      provider: "WOOCOMMERCE" as const,
      externalProductId: "p2",
      externalVariantId: "",
      mappedProductId: "m2",
      productTitle: "Fries",
      sku: "FRI-1",
      kitchenQuantity: 5,
      channelQuantity: 8,
    },
  ];

  it("extracts channel quantities from provider payloads", () => {
    expect(
      extractShopifyChannelQuantity({ variant: { inventoryQuantity: 12 } }),
    ).toBe(12);
    expect(extractWooChannelQuantity({ stock_quantity: 7 })).toBe(7);
  });

  it("detects conflicts when kitchen and channel differ", () => {
    const conflicts = detectInventoryConflicts(levels);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.delta).toBe(-3);
  });

  it("builds snapshot with in-sync count", () => {
    const snapshot = buildInventorySyncSnapshot({ levels });
    expect(snapshot.inSyncCount).toBe(1);
    expect(snapshot.conflicts).toHaveLength(1);
  });

  it("resolves conflicts by strategy", () => {
    const conflict = detectInventoryConflicts(levels)[0]!;
    const kitchen = resolveConflictQuantity(conflict, "kitchen_wins");
    expect(kitchen.resolved).toBe(true);
    expect(kitchen.channelQuantity).toBe(5);

    const plan = applyInventorySyncPlan({
      conflicts: [conflict],
      strategy: "kitchen_wins",
    });
    expect(plan.resolved).toBe(1);
    expect(plan.remainingConflicts).toHaveLength(0);
  });
});
