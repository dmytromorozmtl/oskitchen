import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA154_CANONICAL_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_CAPABILITIES,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_INTEGRATION_HEALTH_PATH,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_SUMMARY_ARTIFACT,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-live-smoke-era154-policy";
import {
  auditWooCommerceLiveSmokeEra154Wiring,
  buildWooCommerceLiveSmokeEra154Summary,
  resolveWooCommerceLiveSmokeEra154ProofStatus,
} from "@/lib/integrations/woocommerce-live-smoke-era154-smoke-summary";
import { WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID } from "@/lib/integrations/woocommerce-live-smoke-era71-policy";
import { inventorySyncTopicForSmoke } from "@/services/integrations/woocommerce-live-smoke-service";

const ROOT = process.cwd();

describe("woocommerce live smoke era154", () => {
  it("locks era154 policy and artifact path", () => {
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID).toBe("era154-woocommerce-live-v1");
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA154_SUMMARY_ARTIFACT).toBe(
      "artifacts/woocommerce-live-smoke-era154-smoke-summary.json",
    );
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA154_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA154_WIRING_PATHS).toHaveLength(7);
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA154_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era154 with canonical WooCommerce live smoke policy", () => {
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA154_CANONICAL_POLICY_ID).toBe(
      WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
    );
  });

  it("audits in-repo WooCommerce LIVE integration wiring", () => {
    const audit = auditWooCommerceLiveSmokeEra154Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of WOOCOMMERCE_LIVE_SMOKE_ERA154_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes REST webhook canonical order KDS inventory wiring", () => {
    const processor = readFileSync(
      join(ROOT, "lib/webhooks/woocommerce-webhook-processor.ts"),
      "utf8",
    );
    expect(processor).toContain("persistNormalizedExternalOrder");
    expect(processor).toContain("importWooCommerceOrderToKitchen");
    expect(processor).toContain("syncWooCommerceInventoryFromOrder");

    const smoke = readFileSync(join(ROOT, "scripts/smoke-woocommerce-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("inventory_sync_bidirectional_complete");
    expect(inventorySyncTopicForSmoke()).toBe("order.created");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveWooCommerceLiveSmokeEra154ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveWooCommerceLiveSmokeEra154ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildWooCommerceLiveSmokeEra154Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("canonical_order");
    expect(summary.capabilities).toContain("kds_inventory");
  });
});
