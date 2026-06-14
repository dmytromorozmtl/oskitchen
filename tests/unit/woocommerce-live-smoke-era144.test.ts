import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA144_CANONICAL_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_CAPABILITIES,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_INTEGRATION_HEALTH_PATH,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_SUMMARY_ARTIFACT,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-live-smoke-era144-policy";
import {
  auditWooCommerceLiveSmokeEra144Wiring,
  buildWooCommerceLiveSmokeEra144Summary,
  resolveWooCommerceLiveSmokeEra144ProofStatus,
} from "@/lib/integrations/woocommerce-live-smoke-era144-smoke-summary";
import { WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID } from "@/lib/integrations/woocommerce-live-smoke-era71-policy";
import { inventorySyncTopicForSmoke } from "@/services/integrations/woocommerce-live-smoke-service";

const ROOT = process.cwd();

describe("woocommerce live smoke era144", () => {
  it("locks era144 policy and artifact path", () => {
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID).toBe(
      "era144-woocommerce-live-smoke-v1",
    );
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA144_SUMMARY_ARTIFACT).toBe(
      "artifacts/woocommerce-live-smoke-era144-smoke-summary.json",
    );
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA144_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA144_WIRING_PATHS).toHaveLength(7);
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA144_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era144 with canonical WooCommerce live smoke policy", () => {
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA144_CANONICAL_POLICY_ID).toBe(
      WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
    );
  });

  it("audits in-repo WooCommerce LIVE smoke wiring", () => {
    const audit = auditWooCommerceLiveSmokeEra144Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of WOOCOMMERCE_LIVE_SMOKE_ERA144_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes REST webhook KDS inventory wiring", () => {
    const processor = readFileSync(
      join(ROOT, "lib/webhooks/woocommerce-webhook-processor.ts"),
      "utf8",
    );
    expect(processor).toContain("importWooCommerceOrderToKitchen");
    expect(processor).toContain("syncWooCommerceInventoryFromOrder");

    const smoke = readFileSync(join(ROOT, "scripts/smoke-woocommerce-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("inventory_sync_bidirectional_complete");
    expect(inventorySyncTopicForSmoke()).toBe("order.created");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveWooCommerceLiveSmokeEra144ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveWooCommerceLiveSmokeEra144ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildWooCommerceLiveSmokeEra144Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("kds_inventory");
  });
});
