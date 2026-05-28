/**
 * Storefront Stripe live-card (Playwright) E2E CI policy — Evolution Era 7 Cycle 2.
 *
 * Tier 2 certifies storefront money path via unit + pay-later E2E on every
 * `storefront-money-path` run. Stripe iframe checkout E2E is optional when
 * repository secrets exist; CI must never imply Stripe E2E passed when skipped.
 */

export const STOREFRONT_STRIPE_E2E_POLICY_ID = "era7-storefront-stripe-optional-v1" as const;

export type StorefrontStripeE2eCiStatus = "PASSED" | "FAILED" | "SKIPPED";

export const STOREFRONT_STRIPE_E2E_REQUIRED_SECRETS = ["STRIPE_SECRET_KEY"] as const;

/** Set to `1` in the optional CI step (not a repository secret). */
export const STOREFRONT_STRIPE_E2E_ENABLE_ENV = "STOREFRONT_E2E_STRIPE" as const;

export const STOREFRONT_STRIPE_E2E_OPTIONAL_ENV = [
  "E2E_STOREFRONT_SLUG",
  "E2E_STORE_SLUG",
  "CI_STOREFRONT_SLUG",
] as const;

/** Always executed in `storefront-money-path` regardless of Stripe secrets. */
export const STOREFRONT_MONEY_PATH_ALWAYS_ON_SCRIPTS = [
  "test:ci:storefront-money-path:unit",
  "test:ci:storefront-money-path:e2e",
] as const;

export type StorefrontStripeE2eCiSummary = {
  policyId: typeof STOREFRONT_STRIPE_E2E_POLICY_ID;
  status: StorefrontStripeE2eCiStatus;
  reason: string;
  secretsPresent: boolean;
  stripeE2eEnabled: boolean;
  e2eStepOutcome: string | null;
  recordedAt: string;
  alwaysOnCertification: readonly string[];
};

export type ResolveStorefrontStripeE2eCiInput = {
  stripeSecretKey?: string | null;
  storefrontE2eStripe?: string | null;
  e2eStepOutcome?: string | null;
};

export function secretsPresentForStorefrontStripeE2e(
  input: Pick<ResolveStorefrontStripeE2eCiInput, "stripeSecretKey">,
): boolean {
  return Boolean(input.stripeSecretKey?.trim());
}

export function stripeE2eFlagEnabled(storefrontE2eStripe?: string | null): boolean {
  return storefrontE2eStripe?.trim() === "1";
}

export function resolveStorefrontStripeE2eCiStatus(
  input: ResolveStorefrontStripeE2eCiInput,
): Pick<
  StorefrontStripeE2eCiSummary,
  "status" | "reason" | "secretsPresent" | "stripeE2eEnabled" | "e2eStepOutcome"
> {
  const secretsPresent = secretsPresentForStorefrontStripeE2e(input);
  const stripeE2eEnabled = stripeE2eFlagEnabled(input.storefrontE2eStripe);
  const e2eStepOutcome = input.e2eStepOutcome?.trim() || null;

  if (!secretsPresent) {
    return {
      status: "SKIPPED",
      reason:
        "Missing repository secret STRIPE_SECRET_KEY. Tier-2 unit tests and pay-later checkout E2E still ran.",
      secretsPresent: false,
      stripeE2eEnabled,
      e2eStepOutcome,
    };
  }

  if (!stripeE2eEnabled) {
    return {
      status: "SKIPPED",
      reason:
        "STRIPE_SECRET_KEY is configured but STOREFRONT_E2E_STRIPE is not set to 1 for the optional Stripe step. Pay-later E2E certification still applies.",
      secretsPresent: true,
      stripeE2eEnabled: false,
      e2eStepOutcome,
    };
  }

  if (e2eStepOutcome === "success") {
    return {
      status: "PASSED",
      reason: "Playwright Stripe live-card storefront checkout E2E completed successfully.",
      secretsPresent: true,
      stripeE2eEnabled: true,
      e2eStepOutcome,
    };
  }

  if (e2eStepOutcome === "skipped" || e2eStepOutcome === null) {
    return {
      status: "SKIPPED",
      reason:
        "Stripe secrets and STOREFRONT_E2E_STRIPE=1 are configured but the Stripe browser E2E step did not run (workflow outcome skipped or unset). Pay-later E2E certification still applies.",
      secretsPresent: true,
      stripeE2eEnabled: true,
      e2eStepOutcome,
    };
  }

  return {
    status: "FAILED",
    reason: `Storefront Stripe browser E2E step outcome: ${e2eStepOutcome}.`,
    secretsPresent: true,
    stripeE2eEnabled: true,
    e2eStepOutcome,
  };
}

export function buildStorefrontStripeE2eCiSummary(
  input: ResolveStorefrontStripeE2eCiInput,
  recordedAt: string = new Date().toISOString(),
): StorefrontStripeE2eCiSummary {
  const resolved = resolveStorefrontStripeE2eCiStatus(input);
  return {
    policyId: STOREFRONT_STRIPE_E2E_POLICY_ID,
    ...resolved,
    recordedAt,
    alwaysOnCertification: STOREFRONT_MONEY_PATH_ALWAYS_ON_SCRIPTS,
  };
}

export function exitCodeForStorefrontStripeE2eCiStatus(
  status: StorefrontStripeE2eCiStatus,
): number {
  return status === "FAILED" ? 1 : 0;
}

/**
 * Explicit fork-skip acceptance — forks without Stripe secrets stay green when
 * always-on tier-2 certs pass; the policy artifact must report SKIPPED.
 */
export const STOREFRONT_STRIPE_E2E_SECRETS_POLICY_ID =
  "era7-storefront-stripe-secrets-accept-v1" as const;

export const STOREFRONT_STRIPE_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS = true as const;

export const STOREFRONT_STRIPE_E2E_CANONICAL_DOC_PATHS = [
  "docs/ci-e2e-tier-matrix.md",
  "docs/TESTING.md",
] as const;

export const STOREFRONT_STRIPE_E2E_MATRIX_DOC = "docs/feature-maturity-matrix.md" as const;

export const STOREFRONT_STRIPE_E2E_MATRIX_MARKERS = [
  STOREFRONT_STRIPE_E2E_POLICY_ID,
  STOREFRONT_STRIPE_E2E_SECRETS_POLICY_ID,
  "STRIPE_SECRET_KEY",
  "STOREFRONT_E2E_STRIPE",
] as const;

export const STOREFRONT_STRIPE_E2E_CANONICAL_DOC_MARKERS = [
  STOREFRONT_STRIPE_E2E_POLICY_ID,
  STOREFRONT_STRIPE_E2E_SECRETS_POLICY_ID,
  "STRIPE_SECRET_KEY",
  "STOREFRONT_E2E_STRIPE",
  "storefront-stripe-e2e-summary",
  "PASSED",
  "SKIPPED",
  "FAILED",
] as const;

/** Phrases that must not appear in canonical storefront CI/GTM docs. */
export const STOREFRONT_STRIPE_E2E_FORBIDDEN_MATURITY_PHRASES = [
  "stripe live-card e2e always runs in ci",
  "playwright stripe certified on every pr",
  "production-certified stripe connect checkout",
  "green ci proves live stripe card e2e passed",
] as const;
