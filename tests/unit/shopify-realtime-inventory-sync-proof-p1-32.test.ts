import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_ARTIFACT,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CHECK_NPM_SCRIPT,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CI_NPM_SCRIPT,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CI_WORKFLOW,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_DOC,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_E2E_SPEC,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_POLICY_ID,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_REQUIRED_STEP_IDS,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_SERVICE,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WEBHOOK_TOPIC,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WIRING_PATHS,
} from "@/lib/integrations/shopify-realtime-inventory-sync-proof-p1-32-policy";
import { parseShopifyInventoryLevelWebhook } from "@/services/integrations/shopify-inventory";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Shopify real-time inventory sync proof (P1-32)", () => {
  it("locks P1-32 policy and inventory_levels/update proof steps", () => {
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_POLICY_ID).toBe(
      "shopify-realtime-inventory-sync-proof-p1-32-v1",
    );
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WEBHOOK_TOPIC).toBe(
      "inventory_levels/update",
    );
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS).toBe(5000);
    expect(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_REQUIRED_STEP_IDS).toEqual([
      "realtime_inventory_fixture",
      "inventory_levels_update_webhook",
      "kitchen_qty_updated_within_budget",
      "realtime_sync_complete",
    ]);
  });

  it("parses inventory_levels/update webhook payload", () => {
    const parsed = parseShopifyInventoryLevelWebhook({
      inventory_item_id: 99001,
      location_id: 1,
      available: 14,
    });
    expect(parsed.inventoryItemId).toBe("99001");
    expect(parsed.available).toBe(14);
    expect(parsed.locationId).toBe("1");
  });

  it("wires real-time sync in webhook processor and inventory service", () => {
    const processor = readSource("lib/webhooks/shopify-webhook-processor.ts");
    expect(processor).toContain("inventory_levels/update");
    expect(processor).toContain("syncShopifyInventoryFromInventoryLevelWebhook");
    expect(processor).toContain("parseShopifyInventoryLevelWebhook");

    const service = readSource("services/integrations/shopify/inventory-sync.service.ts");
    expect(service).toContain("export async function syncShopifyInventoryFromInventoryLevelWebhook");
  });

  it("proof service runs inventory_levels/update smoke with latency budget", () => {
    const proof = readSource(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_SERVICE);
    expect(proof).toContain("appendShopifyRealtimeInventoryProofSteps");
    expect(proof).toContain("inventory_levels/update");
    expect(proof).toContain("SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS");
  });

  it("P1-32 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CI_NPM_SCRIPT}"`);

    const ci = readSource(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CI_WORKFLOW);
    expect(ci).toContain(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CHECK_NPM_SCRIPT);

    const doc = readSource(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_DOC);
    expect(doc).toContain(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_POLICY_ID);

    const artifact = JSON.parse(readSource(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_ARTIFACT));
    expect(artifact.policyId).toBe(SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_POLICY_ID);
    expect(artifact.webhookTopic).toBe("inventory_levels/update");

    expect(existsSync(join(ROOT, SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_E2E_SPEC))).toBe(true);
  });
});
