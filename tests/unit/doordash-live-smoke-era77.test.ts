import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DOORDASH_LIVE_SMOKE_ERA77_INTEGRATION_HEALTH_PATH,
  DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT,
  DOORDASH_LIVE_SMOKE_ERA77_WIRING_PATHS,
} from "@/lib/integrations/doordash-live-smoke-era77-policy";
import {
  auditDoorDashLiveSmokeWiring,
  buildDoorDashLiveSmokeEra77Summary,
  isPlaceholderDoorDashMerchantId,
  resolveDoorDashLiveSmokeEra77ProofStatus,
} from "@/lib/integrations/doordash-live-smoke-summary";
import { statusSyncTopicForSmoke } from "@/services/integrations/doordash-live-smoke-service";

const ROOT = process.cwd();

describe("doordash live smoke era77", () => {
  it("locks era77 policy and artifact path", () => {
    expect(DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID).toBe("era77-doordash-live-smoke-v1");
    expect(DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT).toBe(
      "artifacts/doordash-live-smoke-summary.json",
    );
    expect(DOORDASH_LIVE_SMOKE_ERA77_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder DoorDash merchant IDs", () => {
    expect(isPlaceholderDoorDashMerchantId("smoke-test-merchant-id")).toBe(true);
    expect(isPlaceholderDoorDashMerchantId("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isPlaceholderDoorDashMerchantId("merchant-abc123")).toBe(false);
  });

  it("audits in-repo DoorDash live smoke wiring", () => {
    const audit = auditDoorDashLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of DOORDASH_LIVE_SMOKE_ERA77_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("uses orders for status sync smoke topic", () => {
    expect(statusSyncTopicForSmoke()).toBe("orders");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-doordash-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(smoke).toContain("orders");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveDoorDashLiveSmokeEra77ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveDoorDashLiveSmokeEra77ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_store",
      }),
    ).toBe("proof_skipped_placeholder_store");
  });

  it("builds SKIPPED summary when placeholder merchant blocks live API", () => {
    const summary = buildDoorDashLiveSmokeEra77Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_store",
        missingEnvVars: [],
        steps: [
          {
            id: "doordash_api_connection",
            label: "DoorDash marketplace API connection",
            status: "SKIPPED",
            reason: "placeholder merchant",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
