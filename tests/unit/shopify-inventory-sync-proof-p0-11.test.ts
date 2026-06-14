import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_ARTIFACT,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_DOC,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_E2E_SPEC,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_REQUIRED_STEP_IDS,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_WIRING_PATHS,
} from "@/lib/integrations/shopify-inventory-sync-proof-p0-11-policy";
import { extractShopifyInventoryQuantityFromVariant } from "@/services/integrations/shopify-inventory";

const ROOT = process.cwd();

describe("shopify bi-directional inventory sync proof (P0-11)", () => {
  it("locks P0-11 policy, artifact, and required proof steps", () => {
    expect(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID).toBe(
      "p0-11-shopify-inventory-sync-proof-v1",
    );
    expect(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_ARTIFACT).toBe(
      "artifacts/shopify-inventory-sync-proof.json",
    );
    expect(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU).toBe("GOLDEN-SHOPIFY-1");
    expect(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_REQUIRED_STEP_IDS).toEqual([
      "merchant_proof_fixture",
      "inventory_sync_outbound_kitchen",
      "inventory_sync_inbound_product_webhook",
      "inventory_sync_bidirectional_complete",
    ]);
  });

  it("extracts Shopify variant inventory_quantity", () => {
    expect(extractShopifyInventoryQuantityFromVariant({ inventory_quantity: 11 })).toBe(11);
    expect(extractShopifyInventoryQuantityFromVariant({ inventory_quantity: null })).toBeNull();
  });

  it("wires inbound + outbound inventory sync in webhook processor", () => {
    const processor = readFileSync(
      join(ROOT, "lib/webhooks/shopify-webhook-processor.ts"),
      "utf8",
    );
    expect(processor).toContain("syncShopifyInventoryFromOrder");
    expect(processor).toContain("syncShopifyInventoryFromProductWebhook");
    expect(processor).toContain("extractShopifyInventoryQuantityFromVariant");
  });

  it("documents P0-11 and wires smoke + E2E paths", () => {
    for (const rel of SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
    const doc = readFileSync(join(ROOT, SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_DOC), "utf8");
    expect(doc).toContain(SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID);
    expect(doc).toContain("products/update");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-shopify-live.ts"), "utf8");
    expect(smoke).toContain("appendShopifyInventoryProofStepsAfterOrder");
    expect(smoke).toContain("SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_ARTIFACT");
    expect(existsSync(join(ROOT, SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_E2E_SPEC))).toBe(true);
  });
});
