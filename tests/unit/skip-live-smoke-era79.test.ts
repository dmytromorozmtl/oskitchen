import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SKIP_LIVE_SMOKE_ERA79_INTEGRATION_HEALTH_PATH,
  SKIP_LIVE_SMOKE_ERA79_POLICY_ID,
  SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT,
  SKIP_LIVE_SMOKE_ERA79_WIRING_PATHS,
} from "@/lib/integrations/skip-live-smoke-era79-policy";
import {
  auditSkipLiveSmokeWiring,
  buildSkipLiveSmokeEra79Summary,
  isPlaceholderSkipRestaurantId,
  resolveSkipLiveSmokeEra79ProofStatus,
} from "@/lib/integrations/skip-live-smoke-summary";
import { statusSyncTopicForSmoke } from "@/services/integrations/skip-live-smoke-service";

const ROOT = process.cwd();

describe("skip live smoke era79", () => {
  it("locks era79 policy and artifact path", () => {
    expect(SKIP_LIVE_SMOKE_ERA79_POLICY_ID).toBe("era79-skip-live-smoke-v1");
    expect(SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT).toBe(
      "artifacts/skip-live-smoke-summary.json",
    );
    expect(SKIP_LIVE_SMOKE_ERA79_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Skip restaurant IDs", () => {
    expect(isPlaceholderSkipRestaurantId("smoke-test-restaurant-id")).toBe(true);
    expect(isPlaceholderSkipRestaurantId("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isPlaceholderSkipRestaurantId("restaurant-abc123")).toBe(false);
  });

  it("audits in-repo Skip live smoke wiring", () => {
    const audit = auditSkipLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SKIP_LIVE_SMOKE_ERA79_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("uses orders for status sync smoke topic", () => {
    expect(statusSyncTopicForSmoke()).toBe("orders");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-skip-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(smoke).toContain("orders");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveSkipLiveSmokeEra79ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveSkipLiveSmokeEra79ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_store",
      }),
    ).toBe("proof_skipped_placeholder_store");
  });

  it("builds SKIPPED summary when placeholder restaurant blocks live API", () => {
    const summary = buildSkipLiveSmokeEra79Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_store",
        missingEnvVars: [],
        steps: [
          {
            id: "skip_api_connection",
            label: "Skip OAuth marketplace API connection",
            status: "SKIPPED",
            reason: "placeholder restaurant",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
