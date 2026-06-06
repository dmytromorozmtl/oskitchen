import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  UBER_EATS_LIVE_SMOKE_ERA76_INTEGRATION_HEALTH_PATH,
  UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT,
  UBER_EATS_LIVE_SMOKE_ERA76_WIRING_PATHS,
} from "@/lib/integrations/uber-eats-live-smoke-era76-policy";
import {
  auditUberEatsLiveSmokeWiring,
  buildUberEatsLiveSmokeEra76Summary,
  isPlaceholderUberEatsStoreId,
  resolveUberEatsLiveSmokeEra76ProofStatus,
} from "@/lib/integrations/uber-eats-live-smoke-summary";
import { statusSyncTopicForSmoke } from "@/services/integrations/uber-eats-live-smoke-service";

const ROOT = process.cwd();

describe("uber eats live smoke era76", () => {
  it("locks era76 policy and artifact path", () => {
    expect(UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID).toBe("era76-uber-eats-live-smoke-v1");
    expect(UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT).toBe(
      "artifacts/uber-eats-live-smoke-summary.json",
    );
    expect(UBER_EATS_LIVE_SMOKE_ERA76_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Uber Eats store UUIDs", () => {
    expect(isPlaceholderUberEatsStoreId("smoke-test-store-uuid")).toBe(true);
    expect(isPlaceholderUberEatsStoreId("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isPlaceholderUberEatsStoreId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(false);
  });

  it("audits in-repo Uber Eats live smoke wiring", () => {
    const audit = auditUberEatsLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of UBER_EATS_LIVE_SMOKE_ERA76_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("uses orders for status sync smoke topic", () => {
    expect(statusSyncTopicForSmoke()).toBe("orders");
    const smoke = readFileSync(join(ROOT, "scripts/smoke-uber-eats-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(smoke).toContain("orders");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveUberEatsLiveSmokeEra76ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveUberEatsLiveSmokeEra76ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_store",
      }),
    ).toBe("proof_skipped_placeholder_store");
  });

  it("builds SKIPPED summary when placeholder store blocks live OAuth", () => {
    const summary = buildUberEatsLiveSmokeEra76Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_store",
        missingEnvVars: [],
        steps: [
          {
            id: "uber_oauth_connection",
            label: "Uber Eats OAuth token exchange",
            status: "SKIPPED",
            reason: "placeholder store",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
