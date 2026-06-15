/**
 * Commercial pilot runbook policy — Evolution Era 7 Cycle 1.
 *
 * One canonical operator onboarding path aligned with
 * `docs/feature-maturity-matrix.md` — not a substitute for dated PILOT_* audit files.
 */

export const COMMERCIAL_PILOT_RUNBOOK_POLICY_ID = "era7-commercial-pilot-runbooks-v1" as const;

export const COMMERCIAL_PILOT_RUNBOOK_DOC = "docs/commercial-pilot-runbook.md" as const;

export const COMMERCIAL_PILOT_RUNBOOK_MATRIX_DOC = "docs/feature-maturity-matrix.md" as const;

/** Required H2 sections in the canonical runbook. */
export const COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS = [
  "Purpose and honesty rules",
  "Tier 0 — Engineering release gate (CI)",
  "Tier 1 — Staging environment readiness",
  "Tier 2 — Operator golden path (manual)",
  "Tier 3 — Money-path smoke",
  "Maturity matrix alignment",
  "Deprecated pilot doc family",
  "What we do not claim in pilots",
] as const;

/** CI commands operators/engineering run before a paid pilot GO. */
export const COMMERCIAL_PILOT_TIER0_CI_COMMANDS = [
  "npm run test:ci:governance-bundles",
  "npm run test:ci:scorecard:cert",
  "npm run validate:production-crons",
  "npm run validate:cron-inventory",
] as const;

export const COMMERCIAL_PILOT_TIER1_COMMANDS = [
  "npm run verify-claims",
  "npm run verify:staging-env",
] as const;

/** Marketing honesty gate aligned with feature maturity matrix (Era 7 Cycle 4). */
export const COMMERCIAL_PILOT_MARKETING_CLAIMS_POLICY_ID =
  "era7-marketing-claims-governance-v1" as const;

/** Pilot deploy preflight runs verify-claims in strict mode (Era 8 Cycle 3). */
export const COMMERCIAL_PILOT_PREFLIGHT_CLAIMS_POLICY_ID =
  "era8-pilot-preflight-claims-strict-v1" as const;

export const COMMERCIAL_PILOT_PREFLIGHT_SCRIPT = "scripts/ops/pilot-preflight.sh" as const;

export const COMMERCIAL_PILOT_MONEY_PATH_COMMANDS = [
  "npm run test:ci:storefront-money-path:cert",
  "npm run test:ci:pos-money-path:cert",
] as const;

export const COMMERCIAL_PILOT_FORBIDDEN_CLAIMS = [
  "pilot certified production ready",
  "enterprise SSO included in pilot",
  "unified cross-channel inventory depletion in pilot",
  "rush-hour KDS certified",
] as const;

export const COMMERCIAL_PILOT_CI_SCRIPTS = [
  "test:ci:commercial-pilot-runbook",
  "test:ci:commercial-pilot-runbook:cert",
] as const;

export const COMMERCIAL_PILOT_UNIT_TESTS = [
  "tests/unit/commercial-pilot-runbook-policy.test.ts",
  "tests/unit/commercial-pilot-runbook-ci-live.test.ts",
] as const;

/** Legacy pilot docs — supplementary only; do not treat as canonical truth. */
export const COMMERCIAL_PILOT_DEPRECATED_DOC_PREFIXES = [
  "docs/PILOT_",
  "docs/generated/PILOT_",
] as const;
