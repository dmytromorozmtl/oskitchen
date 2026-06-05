import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SHOPIFY_LIVE_SMOKE_ERA72_INTEGRATION_HEALTH_PATH,
  SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT,
  SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS,
} from "@/lib/integrations/shopify-live-smoke-era72-policy";
import {
  auditShopifyLiveSmokeWiring,
  buildShopifyLiveSmokeEra72Summary,
  isPlaceholderShopifyStoreHost,
  resolveShopifyLiveSmokeEra72ProofStatus,
} from "@/lib/integrations/shopify-live-smoke-summary";
import { inventorySyncTopicForSmoke } from "@/services/integrations/shopify-live-smoke-service";

const ROOT = process.cwd();

describe("shopify live smoke era72", () => {
  it("locks era72 policy and artifact path", () => {
    expect(SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID).toBe("era72-shopify-live-smoke-v1");
    expect(SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT).toBe(
      "artifacts/shopify-live-smoke-summary.json",
    );
    expect(SHOPIFY_LIVE_SMOKE_ERA72_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Shopify store hosts", () => {
    expect(isPlaceholderShopifyStoreHost("smoke-test-os-kitchen.myshopify.com")).toBe(true);
    expect(isPlaceholderShopifyStoreHost("kitchenos-dev.myshopify.com")).toBe(false);
  });

  it("audits in-repo Shopify live smoke wiring", () => {
    const audit = auditShopifyLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("uses orders/create for inventory sync smoke topic", () => {
    expect(inventorySyncTopicForSmoke()).toBe("orders/create");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-shopify-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("inventory_sync_wiring");
    expect(smoke).toContain("orders/create");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveShopifyLiveSmokeEra72ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveShopifyLiveSmokeEra72ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_store",
      }),
    ).toBe("proof_skipped_placeholder_store");
  });

  it("builds SKIPPED summary when placeholder store blocks live Admin API", () => {
    const summary = buildShopifyLiveSmokeEra72Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_store",
        missingEnvVars: [],
        steps: [
          {
            id: "shopify_api_connection",
            label: "Shopify Admin API connection",
            status: "SKIPPED",
            reason: "placeholder host",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
