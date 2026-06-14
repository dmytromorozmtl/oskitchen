import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SHOPIFY_LIVE_SMOKE_ERA145_CANONICAL_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA145_CAPABILITIES,
  SHOPIFY_LIVE_SMOKE_ERA145_INTEGRATION_HEALTH_PATH,
  SHOPIFY_LIVE_SMOKE_ERA145_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA145_SUMMARY_ARTIFACT,
  SHOPIFY_LIVE_SMOKE_ERA145_WIRING_PATHS,
} from "@/lib/integrations/shopify-live-smoke-era145-policy";
import {
  auditShopifyLiveSmokeEra145Wiring,
  buildShopifyLiveSmokeEra145Summary,
  resolveShopifyLiveSmokeEra145ProofStatus,
} from "@/lib/integrations/shopify-live-smoke-era145-smoke-summary";
import { SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID } from "@/lib/integrations/shopify-live-smoke-era72-policy";
import { inventorySyncTopicForSmoke } from "@/services/integrations/shopify-live-smoke-service";

const ROOT = process.cwd();

describe("shopify live smoke era145", () => {
  it("locks era145 policy and artifact path", () => {
    expect(SHOPIFY_LIVE_SMOKE_ERA145_POLICY_ID).toBe("era145-shopify-live-smoke-v1");
    expect(SHOPIFY_LIVE_SMOKE_ERA145_SUMMARY_ARTIFACT).toBe(
      "artifacts/shopify-live-smoke-era145-smoke-summary.json",
    );
    expect(SHOPIFY_LIVE_SMOKE_ERA145_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(SHOPIFY_LIVE_SMOKE_ERA145_WIRING_PATHS).toHaveLength(7);
    expect(SHOPIFY_LIVE_SMOKE_ERA145_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era145 with canonical Shopify live smoke policy", () => {
    expect(SHOPIFY_LIVE_SMOKE_ERA145_CANONICAL_POLICY_ID).toBe(
      SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID,
    );
  });

  it("audits in-repo Shopify LIVE smoke wiring", () => {
    const audit = auditShopifyLiveSmokeEra145Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SHOPIFY_LIVE_SMOKE_ERA145_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes Admin API webhook KDS inventory wiring", () => {
    const processor = readFileSync(
      join(ROOT, "lib/webhooks/shopify-webhook-processor.ts"),
      "utf8",
    );
    expect(processor).toContain("importShopifyOrderToKitchen");
    expect(processor).toContain("syncShopifyInventoryFromOrder");

    const smoke = readFileSync(join(ROOT, "scripts/smoke-shopify-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("inventory_sync_bidirectional_complete");
    expect(inventorySyncTopicForSmoke()).toBe("orders/create");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveShopifyLiveSmokeEra145ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveShopifyLiveSmokeEra145ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildShopifyLiveSmokeEra145Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("kds_inventory");
  });
});
