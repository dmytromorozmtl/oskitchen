import { describe, expect, it } from "vitest";

import {
  STOREFRONT_MONEY_PATH_ALWAYS_ON_SCRIPTS,
  STOREFRONT_STRIPE_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS,
  STOREFRONT_STRIPE_E2E_POLICY_ID,
  STOREFRONT_STRIPE_E2E_SECRETS_POLICY_ID,
  buildStorefrontStripeE2eCiSummary,
  exitCodeForStorefrontStripeE2eCiStatus,
  resolveStorefrontStripeE2eCiStatus,
} from "@/lib/ci/storefront-stripe-e2e-policy";

describe("storefront Stripe E2E CI policy", () => {
  it("uses era7 optional Stripe tier policy ids", () => {
    expect(STOREFRONT_STRIPE_E2E_POLICY_ID).toBe("era7-storefront-stripe-optional-v1");
    expect(STOREFRONT_STRIPE_E2E_SECRETS_POLICY_ID).toBe(
      "era7-storefront-stripe-secrets-accept-v1",
    );
    expect(STOREFRONT_STRIPE_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS).toBe(true);
    expect(STOREFRONT_MONEY_PATH_ALWAYS_ON_SCRIPTS).toHaveLength(2);
  });

  it("SKIPPED when Stripe secret is absent", () => {
    const resolved = resolveStorefrontStripeE2eCiStatus({
      stripeSecretKey: "",
      storefrontE2eStripe: "1",
      e2eStepOutcome: "skipped",
    });
    expect(resolved.status).toBe("SKIPPED");
    expect(resolved.secretsPresent).toBe(false);
    expect(exitCodeForStorefrontStripeE2eCiStatus("SKIPPED")).toBe(0);
  });

  it("SKIPPED when secret exists but STOREFRONT_E2E_STRIPE is not 1", () => {
    const resolved = resolveStorefrontStripeE2eCiStatus({
      stripeSecretKey: "sk_test_xxx",
      storefrontE2eStripe: "",
      e2eStepOutcome: null,
    });
    expect(resolved.status).toBe("SKIPPED");
    expect(resolved.secretsPresent).toBe(true);
    expect(resolved.stripeE2eEnabled).toBe(false);
  });

  it("PASSED when secrets and flag exist and E2E step succeeded", () => {
    const resolved = resolveStorefrontStripeE2eCiStatus({
      stripeSecretKey: "sk_test_xxx",
      storefrontE2eStripe: "1",
      e2eStepOutcome: "success",
    });
    expect(resolved.status).toBe("PASSED");
    expect(exitCodeForStorefrontStripeE2eCiStatus("PASSED")).toBe(0);
  });

  it("FAILED when secrets exist but E2E step failed", () => {
    const resolved = resolveStorefrontStripeE2eCiStatus({
      stripeSecretKey: "sk_test_xxx",
      storefrontE2eStripe: "1",
      e2eStepOutcome: "failure",
    });
    expect(resolved.status).toBe("FAILED");
    expect(exitCodeForStorefrontStripeE2eCiStatus("FAILED")).toBe(1);
  });

  it("builds artifact-shaped summary", () => {
    const summary = buildStorefrontStripeE2eCiSummary(
      {
        stripeSecretKey: "sk_test_xxx",
        storefrontE2eStripe: "1",
        e2eStepOutcome: "success",
      },
      "2026-05-27T00:00:00.000Z",
    );
    expect(summary.policyId).toBe("era7-storefront-stripe-optional-v1");
    expect(summary.status).toBe("PASSED");
    expect(summary.recordedAt).toBe("2026-05-27T00:00:00.000Z");
    expect(summary.alwaysOnCertification).toContain("test:ci:storefront-money-path:e2e");
  });
});
