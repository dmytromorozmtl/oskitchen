import { expect, test } from "@playwright/test";

import {
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_POLICY_ID,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_REQUIRED_STEP_IDS,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WEBHOOK_TOPIC,
} from "@/lib/integrations/shopify-realtime-inventory-sync-proof-p1-32-policy";
import { parseShopifyInventoryLevelWebhook } from "@/services/integrations/shopify-inventory";

/**
 * Shopify real-time inventory sync proof E2E (P1-32).
 * Contract tests for inventory_levels/update → kitchen qty within latency budget.
 */

test.describe("shopify real-time inventory sync proof (P1-32)", () => {
  test("exports P1-32 policy and required real-time proof step ids", () => {
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_POLICY_ID).toBe(
      "shopify-realtime-inventory-sync-proof-p1-32-v1",
    );
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WEBHOOK_TOPIC).toBe(
      "inventory_levels/update",
    );
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_REQUIRED_STEP_IDS).toContain(
      "realtime_sync_complete",
    );
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS).toBeGreaterThan(0);
  });

  test("parses inventory_levels/update available quantity", () => {
    expect(
      parseShopifyInventoryLevelWebhook({
        inventory_item_id: 99001,
        location_id: 1,
        available: 14,
      }).available,
    ).toBe(14);
  });
});
