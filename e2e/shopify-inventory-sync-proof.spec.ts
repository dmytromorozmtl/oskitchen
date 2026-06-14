import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

import { CHANNEL_GOLDEN_PATH_FIXTURES } from "@/lib/integrations/channel-golden-path-policy";
import {
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_REQUIRED_STEP_IDS,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU,
} from "@/lib/integrations/shopify-inventory-sync-proof-p0-11-policy";
import { extractShopifyInventoryQuantityFromVariant } from "@/services/integrations/shopify-inventory";
import { normalizeShopifyRestOrder } from "@/services/integrations/shopify";

/**
 * Shopify bi-directional inventory sync proof E2E (P0-11).
 *
 * Contract tests + golden-path fixture validation for orders/create outbound
 * and products/update inbound inventory sync proof chain.
 */

test.describe("shopify inventory sync proof policy (P0-11)", () => {
  test("exports P0-11 policy and required proof step ids", () => {
    expect(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID).toBe(
      "p0-11-shopify-inventory-sync-proof-v1",
    );
    expect(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_REQUIRED_STEP_IDS).toContain(
      "inventory_sync_bidirectional_complete",
    );
  });

  test("golden-path Shopify order fixture includes inventory proof SKU", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), CHANNEL_GOLDEN_PATH_FIXTURES.shopifyOrder), "utf8"),
    ) as Record<string, unknown>;
    const normalized = normalizeShopifyRestOrder(raw);
    expect(normalized.lineItems[0]?.sku).toBe(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU);
    expect(normalized.lineItems[0]?.quantity).toBe(1);
  });

  test("extracts inventory_quantity from Shopify variant payload", () => {
    expect(
      extractShopifyInventoryQuantityFromVariant({
        id: "90001",
        sku: SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU,
        inventory_quantity: 11,
      }),
    ).toBe(11);
  });
});
