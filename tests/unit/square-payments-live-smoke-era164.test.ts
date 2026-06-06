import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CANONICAL_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CAPABILITIES,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_INTEGRATION_HEALTH_PATH,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SUMMARY_ARTIFACT,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_WIRING_PATHS,
} from "@/lib/integrations/square-payments-live-smoke-era164-policy";
import {
  auditSquarePaymentsLiveSmokeEra164Wiring,
  buildSquarePaymentsLiveSmokeEra164Summary,
  resolveSquarePaymentsLiveSmokeEra164ProofStatus,
} from "@/lib/integrations/square-payments-live-smoke-era164-smoke-summary";
import { SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID } from "@/lib/integrations/square-payments-live-smoke-era87-policy";

const ROOT = process.cwd();

describe("square payments live smoke era164", () => {
  it("locks era164 policy and artifact path", () => {
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID).toBe(
      "era164-square-payments-live-v1",
    );
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SUMMARY_ARTIFACT).toBe(
      "artifacts/square-payments-live-smoke-era164-smoke-summary.json",
    );
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_WIRING_PATHS).toHaveLength(8);
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era164 with canonical Square Payments live smoke policy", () => {
    expect(SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CANONICAL_POLICY_ID).toBe(
      SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID,
    );
  });

  it("audits in-repo Square Payments LIVE integration wiring", () => {
    const audit = auditSquarePaymentsLiveSmokeEra164Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth payment processing and refund sync wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-square-payments-live.ts"), "utf8");
    expect(smoke).toContain("payment_processing_wiring");
    expect(smoke).toContain("refund_sync_wiring");
    expect(smoke).toContain("syncSquareRefunds");
    expect(smoke).toContain("listSquareRefundsApi");

    const payment = readFileSync(
      join(ROOT, "services/integrations/square-payments/payment-processing.service.ts"),
      "utf8",
    );
    expect(payment.length).toBeGreaterThan(0);

    const refund = readFileSync(
      join(ROOT, "services/integrations/square-payments/refund-sync.service.ts"),
      "utf8",
    );
    expect(refund).toContain("syncSquareRefunds");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveSquarePaymentsLiveSmokeEra164ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSquarePaymentsLiveSmokeEra164ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildSquarePaymentsLiveSmokeEra164Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("payment_processing");
    expect(summary.capabilities).toContain("refund_sync");
  });
});
