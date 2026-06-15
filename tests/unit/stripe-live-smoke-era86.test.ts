import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  STRIPE_LIVE_SMOKE_ERA86_INTEGRATION_HEALTH_PATH,
  STRIPE_LIVE_SMOKE_ERA86_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT,
  STRIPE_LIVE_SMOKE_ERA86_WIRING_PATHS,
} from "@/lib/integrations/stripe-live-smoke-era86-policy";
import {
  auditStripeLiveSmokeWiring,
  buildStripeLiveSmokeEra86Summary,
  isPlaceholderStripeSecretKey,
  resolveStripeLiveSmokeEra86ProofStatus,
} from "@/lib/integrations/stripe-live-smoke-summary";

const ROOT = process.cwd();

describe("stripe live smoke era86", () => {
  it("locks era86 policy and artifact path", () => {
    expect(STRIPE_LIVE_SMOKE_ERA86_POLICY_ID).toBe("era86-stripe-live-smoke-v1");
    expect(STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT).toBe(
      "artifacts/stripe-live-smoke-summary.json",
    );
    expect(STRIPE_LIVE_SMOKE_ERA86_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Stripe secret keys", () => {
    expect(isPlaceholderStripeSecretKey("sk_test_smoke-test-key")).toBe(true);
    expect(isPlaceholderStripeSecretKey("sk_test_abc123")).toBe(false);
  });

  it("audits in-repo Stripe live smoke wiring", () => {
    const audit = auditStripeLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of STRIPE_LIVE_SMOKE_ERA86_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes PaymentIntent, webhook, and payout steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-stripe-live.ts"), "utf8");
    expect(smoke).toContain("payment_intent_wiring");
    expect(smoke).toContain("webhook_wiring");
    expect(smoke).toContain("payout_reconciliation_wiring");
    expect(smoke).toContain("createStripeLivePaymentIntent");
    expect(smoke).toContain("reconcileStripePayouts");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveStripeLiveSmokeEra86ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveStripeLiveSmokeEra86ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_secret_key",
      }),
    ).toBe("proof_skipped_placeholder_secret_key");
  });

  it("builds SKIPPED summary when placeholder secret key blocks live API", () => {
    const summary = buildStripeLiveSmokeEra86Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_secret_key",
        missingEnvVars: [],
        steps: [
          {
            id: "stripe_api_connection",
            label: "Stripe API connection",
            status: "SKIPPED",
            reason: "placeholder key",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_secret_key");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
