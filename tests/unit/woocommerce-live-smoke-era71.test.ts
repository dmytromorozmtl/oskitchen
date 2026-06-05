import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA71_INTEGRATION_HEALTH_PATH,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-live-smoke-era71-policy";
import {
  auditWooCommerceLiveSmokeWiring,
  buildWooCommerceLiveSmokeEra71Summary,
  isPlaceholderWooStoreHost,
  resolveWooCommerceLiveSmokeEra71ProofStatus,
} from "@/lib/integrations/woocommerce-live-smoke-summary";
import { inventorySyncTopicForSmoke } from "@/services/integrations/woocommerce-live-smoke-service";

const ROOT = process.cwd();

describe("woocommerce live smoke era71", () => {
  it("locks era71 policy and artifact path", () => {
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID).toBe("era71-woocommerce-live-smoke-v1");
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT).toBe(
      "artifacts/woocommerce-live-smoke-summary.json",
    );
    expect(WOOCOMMERCE_LIVE_SMOKE_ERA71_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Woo store hosts", () => {
    expect(isPlaceholderWooStoreHost("smoke-test.os-kitchen.com")).toBe(true);
    expect(isPlaceholderWooStoreHost("my-real-store.example.com")).toBe(true);
    expect(isPlaceholderWooStoreHost("shop.mybrand.com")).toBe(false);
  });

  it("audits in-repo Woo live smoke wiring", () => {
    const audit = auditWooCommerceLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("uses order.created for inventory sync smoke topic", () => {
    expect(inventorySyncTopicForSmoke()).toBe("order.created");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-woocommerce-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("inventory_sync_wiring");
    expect(smoke).toContain("order.created");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveWooCommerceLiveSmokeEra71ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveWooCommerceLiveSmokeEra71ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_store",
      }),
    ).toBe("proof_skipped_placeholder_store");
  });

  it("builds SKIPPED summary when placeholder store blocks live REST", () => {
    const summary = buildWooCommerceLiveSmokeEra71Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_store",
        missingEnvVars: [],
        steps: [
          {
            id: "woo_api_connection",
            label: "WooCommerce REST connection",
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
