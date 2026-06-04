/**
 * FINAL-19 — Trust page BETA / Preview / SKIPPED policy (task-213).
 */

export const TRUST_PAGE_POLICY_ID = "final-19-trust-page-v1" as const;

export const TRUST_PAGE_SUMMARY_ARTIFACT = "artifacts/trust-page-summary.json" as const;

export const TRUST_PAGE_SUMMARY_VERSION = "final-19-trust-page-v1" as const;

export const TRUST_PAGE_ROUTE = "app/trust/page.tsx" as const;

export const TRUST_MATURITY_SECTION_COMPONENT =
  "components/marketing/trust-maturity-labels-section.tsx" as const;

export const TRUST_BETA_BADGE_COMPONENT = "components/ui/beta-badge.tsx" as const;

export const TRUST_PAGE_RUNNER_SCRIPT = "scripts/ops/run-trust-page-audit.ts" as const;

export const TRUST_PAGE_VITEST_SPEC = "tests/unit/trust-page-maturity-surfaces.test.ts" as const;

export const TRUST_PAGE_MARKERS = [
  "Trust page — BETA / PREVIEW / SKIPPED",
  "TrustMaturityLabelsSection",
  "BETA, Preview, Pilot ready, and SKIPPED",
  "SKIPPED integration states are honest",
] as const;

export const TRUST_MATURITY_SECTION_MARKERS = [
  "Public explanation of BETA / Preview / SKIPPED",
  "export function TrustMaturityLabelsSection",
  "BetaBadge",
  "PreviewBadge",
  "SKIPPED is not PASS",
] as const;

export const TRUST_BETA_BADGE_MARKERS = [
  "export function BetaBadge",
  "export function PreviewBadge",
  "BETA",
] as const;
