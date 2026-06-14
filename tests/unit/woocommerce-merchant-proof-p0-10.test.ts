import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT,
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_DOC,
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_POLICY_ID,
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_REQUIRED_STEP_IDS,
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_SMOKE_SKU,
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-merchant-proof-p0-10-policy";
import { extractWooStockQuantity } from "@/services/integrations/woocommerce";

const ROOT = process.cwd();

describe("woocommerce merchant proof — bi-directional inventory sync (P0-10)", () => {
  it("locks P0-10 policy, artifact, and required proof steps", () => {
    expect(WOOCOMMERCE_MERCHANT_PROOF_P0_10_POLICY_ID).toBe(
      "p0-10-woocommerce-merchant-proof-v1",
    );
    expect(WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT).toBe(
      "artifacts/woocommerce-merchant-proof-inventory-sync.json",
    );
    expect(WOOCOMMERCE_MERCHANT_PROOF_P0_10_SMOKE_SKU).toBe("GOLDEN-WOO-1");
    expect(WOOCOMMERCE_MERCHANT_PROOF_P0_10_REQUIRED_STEP_IDS).toEqual([
      "merchant_proof_fixture",
      "inventory_sync_outbound_kitchen",
      "inventory_sync_inbound_product_webhook",
      "inventory_sync_bidirectional_complete",
    ]);
  });

  it("extracts Woo stock quantity from product webhook payloads", () => {
    expect(extractWooStockQuantity({ manage_stock: true, stock_quantity: 11 })).toBe(11);
    expect(extractWooStockQuantity({ manage_stock: false, stock_quantity: 5 })).toBeNull();
  });

  it("wires inbound + outbound inventory sync in webhook processor", () => {
    const processor = readFileSync(
      join(ROOT, "lib/webhooks/woocommerce-webhook-processor.ts"),
      "utf8",
    );
    expect(processor).toContain("syncWooCommerceInventoryFromOrder");
    expect(processor).toContain("syncWooCommerceInventoryFromProductWebhook");
    expect(processor).toContain("extractWooStockQuantity");
  });

  it("documents P0-10 and wires smoke + service paths", () => {
    for (const rel of WOOCOMMERCE_MERCHANT_PROOF_P0_10_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
    const doc = readFileSync(join(ROOT, WOOCOMMERCE_MERCHANT_PROOF_P0_10_DOC), "utf8");
    expect(doc).toContain(WOOCOMMERCE_MERCHANT_PROOF_P0_10_POLICY_ID);
    expect(doc).toContain("product.updated");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-woocommerce-live.ts"), "utf8");
    expect(smoke).toContain("appendMerchantProofInventoryStepsAfterOrder");
    expect(smoke).toContain("WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT");
  });
});
