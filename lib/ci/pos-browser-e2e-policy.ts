/**
 * POS browser (Playwright) E2E CI policy — Evolution Era 4 Cycle 2.
 *
 * Tier 2b certifies software POS money path via unit + integration + inventory
 * on every `pos-money-path` run. Browser E2E is an optional tier when dashboard
 * auth secrets exist; CI must never imply browser E2E passed when it was skipped.
 */

export const POS_BROWSER_E2E_POLICY_ID = "era4-tier2b-optional-v1" as const;

export type PosBrowserE2eCiStatus = "PASSED" | "FAILED" | "SKIPPED";

export const POS_BROWSER_E2E_REQUIRED_SECRETS = [
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export const POS_BROWSER_E2E_OPTIONAL_SECRETS = ["E2E_CI_POS_USER_ID"] as const;

/** Always executed in `pos-money-path` regardless of Playwright secrets. */
export const POS_MONEY_PATH_ALWAYS_ON_SCRIPTS = [
  "test:ci:pos-money-path:unit",
  "test:ci:pos-money-path:integration",
  "test:ci:pos-money-path:inventory",
] as const;

export type PosBrowserE2eCiSummary = {
  policyId: typeof POS_BROWSER_E2E_POLICY_ID;
  status: PosBrowserE2eCiStatus;
  reason: string;
  secretsPresent: boolean;
  e2eStepOutcome: string | null;
  recordedAt: string;
  alwaysOnCertification: readonly string[];
};

export type ResolvePosBrowserE2eCiInput = {
  e2eLoginEmail?: string | null;
  e2eLoginPassword?: string | null;
  e2eStepOutcome?: string | null;
};

export function secretsPresentForPosBrowserE2e(
  input: Pick<ResolvePosBrowserE2eCiInput, "e2eLoginEmail" | "e2eLoginPassword">,
): boolean {
  return Boolean(input.e2eLoginEmail?.trim() && input.e2eLoginPassword?.trim());
}

export function resolvePosBrowserE2eCiStatus(
  input: ResolvePosBrowserE2eCiInput,
): Pick<PosBrowserE2eCiSummary, "status" | "reason" | "secretsPresent" | "e2eStepOutcome"> {
  const secretsPresent = secretsPresentForPosBrowserE2e(input);
  const e2eStepOutcome = input.e2eStepOutcome?.trim() || null;

  if (!secretsPresent) {
    return {
      status: "SKIPPED",
      reason:
        "Missing repository secrets E2E_LOGIN_EMAIL and/or E2E_LOGIN_PASSWORD. Tier-2b unit, integration, and inventory certification still ran.",
      secretsPresent: false,
      e2eStepOutcome,
    };
  }

  if (e2eStepOutcome === "success") {
    return {
      status: "PASSED",
      reason: "Playwright POS checkout E2E completed successfully.",
      secretsPresent: true,
      e2eStepOutcome,
    };
  }

  if (e2eStepOutcome === "skipped" || e2eStepOutcome === null) {
    return {
      status: "SKIPPED",
      reason:
        "Dashboard auth secrets are configured but the POS browser E2E step did not run (workflow outcome skipped or unset). Tier-2b unit/integration/inventory certification still applies.",
      secretsPresent: true,
      e2eStepOutcome,
    };
  }

  return {
    status: "FAILED",
    reason: `POS browser E2E step outcome: ${e2eStepOutcome}.`,
    secretsPresent: true,
    e2eStepOutcome,
  };
}

export function buildPosBrowserE2eCiSummary(
  input: ResolvePosBrowserE2eCiInput,
  recordedAt: string = new Date().toISOString(),
): PosBrowserE2eCiSummary {
  const resolved = resolvePosBrowserE2eCiStatus(input);
  return {
    policyId: POS_BROWSER_E2E_POLICY_ID,
    ...resolved,
    recordedAt,
    alwaysOnCertification: POS_MONEY_PATH_ALWAYS_ON_SCRIPTS,
  };
}

export function exitCodeForPosBrowserE2eCiStatus(status: PosBrowserE2eCiStatus): number {
  return status === "FAILED" ? 1 : 0;
}

/**
 * Era 5 Cycle 5 — explicit decision on repository secrets for optional browser tier.
 * Forks without `E2E_LOGIN_*` stay green when tier-2b always-on certs pass; the policy
 * artifact must report SKIPPED (never silent pass).
 */
export const POS_BROWSER_E2E_SECRETS_POLICY_ID = "era5-pos-e2e-secrets-accept-v1" as const;

export const POS_BROWSER_E2E_ACCEPT_FORK_SKIP_WITHOUT_SECRETS = true as const;

export const POS_BROWSER_E2E_CANONICAL_DOC_PATHS = [
  "docs/ci-e2e-tier-matrix.md",
  "docs/TESTING.md",
] as const;

export const POS_BROWSER_E2E_MATRIX_DOC = "docs/feature-maturity-matrix.md" as const;

export const POS_BROWSER_E2E_MATRIX_MARKERS = [
  POS_BROWSER_E2E_POLICY_ID,
  POS_BROWSER_E2E_SECRETS_POLICY_ID,
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export const POS_BROWSER_E2E_CANONICAL_DOC_MARKERS = [
  POS_BROWSER_E2E_POLICY_ID,
  POS_BROWSER_E2E_SECRETS_POLICY_ID,
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
  "pos-browser-e2e-summary",
  "PASSED",
  "SKIPPED",
  "FAILED",
] as const;

/** Phrases that must not appear in canonical POS CI/GTM docs (false browser certification). */
export const POS_BROWSER_E2E_FORBIDDEN_MATURITY_PHRASES = [
  "browser e2e always runs in ci",
  "playwright pos certified on every pr",
  "production-certified hardware pos",
  "green ci proves browser pos e2e passed",
] as const;
