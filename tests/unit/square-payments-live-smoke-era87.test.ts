import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_INTEGRATION_HEALTH_PATH,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_WIRING_PATHS,
} from "@/lib/integrations/square-payments-live-smoke-era87-policy";
import {
  auditSquarePaymentsLiveSmokeWiring,
  buildSquarePaymentsLiveSmokeEra87Summary,
  isPlaceholderSquarePaymentsAccessToken,
  resolveSquarePaymentsLiveSmokeEra87ProofStatus,
} from "@/lib/integrations/square-payments-live-smoke-summary";

const ROOT = process.cwd();

describe("square payments live smoke era87", () => {
  it("locks era87 policy and artifact path", () => {
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID).toBe(
      "era87-square-payments-live-smoke-v1",
    );
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT).toBe(
      "artifacts/square-payments-live-smoke-summary.json",
    );
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Square access tokens", () => {
    expect(isPlaceholderSquarePaymentsAccessToken("smoke-test-square-token")).toBe(true);
    expect(isPlaceholderSquarePaymentsAccessToken("EAAA_live_token")).toBe(false);
  });

  it("audits in-repo Square Payments live smoke wiring", () => {
    const audit = auditSquarePaymentsLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes payment and refund steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-square-payments-live.ts"), "utf8");
    expect(smoke).toContain("payment_processing_wiring");
    expect(smoke).toContain("refund_sync_wiring");
    expect(smoke).toContain("syncSquareRefunds");
    expect(smoke).toContain("listSquareRefundsApi");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveSquarePaymentsLiveSmokeEra87ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveSquarePaymentsLiveSmokeEra87ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_token",
      }),
    ).toBe("proof_skipped_placeholder_token");
  });

  it("builds SKIPPED summary when placeholder token blocks live OAuth", () => {
    const summary = buildSquarePaymentsLiveSmokeEra87Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_token",
        missingEnvVars: [],
        steps: [
          {
            id: "square_oauth_connection",
            label: "Square OAuth API connection",
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
