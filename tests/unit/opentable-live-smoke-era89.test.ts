import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OPENTABLE_LIVE_SMOKE_ERA89_INTEGRATION_HEALTH_PATH,
  OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT,
  OPENTABLE_LIVE_SMOKE_ERA89_WIRING_PATHS,
} from "@/lib/integrations/opentable-live-smoke-era89-policy";
import {
  auditOpenTableLiveSmokeWiring,
  buildOpenTableLiveSmokeEra89Summary,
  isPlaceholderOpenTableAccessToken,
  isPlaceholderOpenTableRestaurantId,
  resolveOpenTableLiveSmokeEra89ProofStatus,
} from "@/lib/integrations/opentable-live-smoke-summary";

const ROOT = process.cwd();

describe("opentable live smoke era89", () => {
  it("locks era89 policy and artifact path", () => {
    expect(OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID).toBe("era89-opentable-live-smoke-v1");
    expect(OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT).toBe(
      "artifacts/opentable-live-smoke-summary.json",
    );
    expect(OPENTABLE_LIVE_SMOKE_ERA89_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder OpenTable credentials", () => {
    expect(isPlaceholderOpenTableAccessToken("smoke-test-opentable-token")).toBe(true);
    expect(isPlaceholderOpenTableAccessToken("live_opentable_token_abc")).toBe(false);
    expect(isPlaceholderOpenTableRestaurantId("smoke-test-rid")).toBe(true);
    expect(isPlaceholderOpenTableRestaurantId("12345678")).toBe(false);
  });

  it("audits in-repo OpenTable live smoke wiring", () => {
    const audit = auditOpenTableLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of OPENTABLE_LIVE_SMOKE_ERA89_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes reservation webhook and availability steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-opentable-live.ts"), "utf8");
    expect(smoke).toContain("reservation_webhook_wiring");
    expect(smoke).toContain("table_availability_wiring");
    expect(smoke).toContain("verifyOpenTableWebhookSignature");
    expect(smoke).toContain("syncOpenTableAvailability");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveOpenTableLiveSmokeEra89ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveOpenTableLiveSmokeEra89ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_token",
      }),
    ).toBe("proof_skipped_placeholder_token");
  });

  it("builds SKIPPED summary when placeholder token blocks live OAuth", () => {
    const summary = buildOpenTableLiveSmokeEra89Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_token",
        missingEnvVars: [],
        steps: [
          {
            id: "opentable_oauth_connection",
            label: "OpenTable OAuth API connection",
            status: "SKIPPED",
            reason: "placeholder token",
          },
        ],
      },
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_token");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
