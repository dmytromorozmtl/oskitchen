import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GRUBHUB_LIVE_SMOKE_ERA78_INTEGRATION_HEALTH_PATH,
  GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT,
  GRUBHUB_LIVE_SMOKE_ERA78_WIRING_PATHS,
} from "@/lib/integrations/grubhub-live-smoke-era78-policy";
import {
  auditGrubhubLiveSmokeWiring,
  buildGrubhubLiveSmokeEra78Summary,
  isPlaceholderGrubhubMerchantId,
  resolveGrubhubLiveSmokeEra78ProofStatus,
} from "@/lib/integrations/grubhub-live-smoke-summary";
import { statusSyncTopicForSmoke } from "@/services/integrations/grubhub-live-smoke-service";

const ROOT = process.cwd();

describe("grubhub live smoke era78", () => {
  it("locks era78 policy and artifact path", () => {
    expect(GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID).toBe("era78-grubhub-live-smoke-v1");
    expect(GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT).toBe(
      "artifacts/grubhub-live-smoke-summary.json",
    );
    expect(GRUBHUB_LIVE_SMOKE_ERA78_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Grubhub merchant IDs", () => {
    expect(isPlaceholderGrubhubMerchantId("smoke-test-merchant-id")).toBe(true);
    expect(isPlaceholderGrubhubMerchantId("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isPlaceholderGrubhubMerchantId("merchant-abc123")).toBe(false);
  });

  it("audits in-repo Grubhub live smoke wiring", () => {
    const audit = auditGrubhubLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of GRUBHUB_LIVE_SMOKE_ERA78_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("uses orders for status sync smoke topic", () => {
    expect(statusSyncTopicForSmoke()).toBe("orders");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-grubhub-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(smoke).toContain("orders");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveGrubhubLiveSmokeEra78ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveGrubhubLiveSmokeEra78ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_store",
      }),
    ).toBe("proof_skipped_placeholder_store");
  });

  it("builds SKIPPED summary when placeholder merchant blocks live API", () => {
    const summary = buildGrubhubLiveSmokeEra78Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_store",
        missingEnvVars: [],
        steps: [
          {
            id: "grubhub_api_connection",
            label: "Grubhub marketplace API connection",
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
