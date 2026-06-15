/**
 * Typecheck slice Era 11 extension — Evolution Era 11 Cycle 1.
 *
 * Adds `platform-auth` slice for platform admin + auth/onboarding surfaces
 * not covered by dashboard or storefront-marketing slices.
 */

export const TYPECHECK_SLICE_ERA11_POLICY_ID = "era11-typecheck-slice-v3" as const;

export const TYPECHECK_SLICE_ERA11_EXTENDS_POLICY_ID = "era5-typecheck-slice-v2" as const;

export const TYPECHECK_SLICE_ERA11_NEW_SLICE_ID = "platform-auth" as const;

export const TYPECHECK_SLICE_ERA11_NEW_SLICE_TSCONFIG =
  "tsconfig.slice.platform-auth.json" as const;

export const TYPECHECK_SLICE_ERA11_CI_SCRIPTS = [
  "test:ci:typecheck-slice-era11",
  "test:ci:typecheck-slice-era11:cert",
] as const;

export const TYPECHECK_SLICE_ERA11_UNIT_TESTS = [
  "tests/unit/typecheck-slice-era11-policy.test.ts",
  "tests/unit/typecheck-slice-era11-cert-live.test.ts",
] as const;

export const TYPECHECK_SLICE_ERA11_CANONICAL_DOC_PATHS = [
  "docs/devops-release-enterprise-readiness.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
] as const;

export const TYPECHECK_SLICE_ERA11_CANONICAL_MARKERS = [
  TYPECHECK_SLICE_ERA11_POLICY_ID,
  TYPECHECK_SLICE_ERA11_EXTENDS_POLICY_ID,
  TYPECHECK_SLICE_ERA11_NEW_SLICE_ID,
  "platform-auth",
] as const;
