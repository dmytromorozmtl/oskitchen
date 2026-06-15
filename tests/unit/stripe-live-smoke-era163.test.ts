import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  STRIPE_LIVE_SMOKE_ERA163_CANONICAL_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA163_CAPABILITIES,
  STRIPE_LIVE_SMOKE_ERA163_INTEGRATION_HEALTH_PATH,
  STRIPE_LIVE_SMOKE_ERA163_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA163_SUMMARY_ARTIFACT,
  STRIPE_LIVE_SMOKE_ERA163_WIRING_PATHS,
} from "@/lib/integrations/stripe-live-smoke-era163-policy";
import {
  auditStripeLiveSmokeEra163Wiring,
  buildStripeLiveSmokeEra163Summary,
  resolveStripeLiveSmokeEra163ProofStatus,
} from "@/lib/integrations/stripe-live-smoke-era163-smoke-summary";
import { STRIPE_LIVE_SMOKE_ERA86_POLICY_ID } from "@/lib/integrations/stripe-live-smoke-era86-policy";

const ROOT = process.cwd();

describe("stripe live smoke era163", () => {
  it("locks era163 policy and artifact path", () => {
    expect(STRIPE_LIVE_SMOKE_ERA163_POLICY_ID).toBe("era163-stripe-live-v1");
    expect(STRIPE_LIVE_SMOKE_ERA163_SUMMARY_ARTIFACT).toBe(
      "artifacts/stripe-live-smoke-era163-smoke-summary.json",
    );
    expect(STRIPE_LIVE_SMOKE_ERA163_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(STRIPE_LIVE_SMOKE_ERA163_WIRING_PATHS).toHaveLength(8);
    expect(STRIPE_LIVE_SMOKE_ERA163_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era163 with canonical Stripe live smoke policy", () => {
    expect(STRIPE_LIVE_SMOKE_ERA163_CANONICAL_POLICY_ID).toBe(STRIPE_LIVE_SMOKE_ERA86_POLICY_ID);
  });

  it("audits in-repo Stripe LIVE integration wiring", () => {
    const audit = auditStripeLiveSmokeEra163Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of STRIPE_LIVE_SMOKE_ERA163_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes PaymentIntent webhook and payout reconciliation wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-stripe-live.ts"), "utf8");
    expect(smoke).toContain("payment_intent_wiring");
    expect(smoke).toContain("webhook_wiring");
    expect(smoke).toContain("payout_reconciliation_wiring");
    expect(smoke).toContain("createStripeLivePaymentIntent");
    expect(smoke).toContain("reconcileStripePayouts");

    const paymentIntent = readFileSync(
      join(ROOT, "services/integrations/stripe/payment-intent.service.ts"),
      "utf8",
    );
    expect(paymentIntent).toContain("createStripeLivePaymentIntent");

    const webhook = readFileSync(
      join(ROOT, "services/integrations/stripe/webhook-handler.service.ts"),
      "utf8",
    );
    expect(webhook.length).toBeGreaterThan(0);

    const payout = readFileSync(
      join(ROOT, "services/integrations/stripe/payout-reconciliation.service.ts"),
      "utf8",
    );
    expect(payout).toContain("reconcileStripePayouts");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveStripeLiveSmokeEra163ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveStripeLiveSmokeEra163ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildStripeLiveSmokeEra163Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("payment_intent");
    expect(summary.capabilities).toContain("payout_reconciliation");
  });
});
