/**
 * Blueprint P3-64 — /commission-comparison interactive calculator page.
 *
 * @see app/commission-comparison/page.tsx
 * @see docs/commission-comparison-landing-p3-64.md
 */

import {
  COMMISSION_COMPARISON_LANDING_META,
  COMMISSION_COMPARISON_LANDING_PATH,
} from "@/lib/marketing/commission-comparison-landing-content";

export const COMMISSION_COMPARISON_LANDING_P3_64_POLICY_ID =
  "commission-comparison-landing-p3-64-v1" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_DOC =
  "docs/commission-comparison-landing-p3-64.md" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_ARTIFACT =
  "artifacts/commission-comparison-landing-p3-64-registry.json" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_AUDIT_SCRIPT =
  "scripts/audit-commission-comparison-landing-p3-64.ts" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPT =
  "audit:commission-comparison-landing-p3-64" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_CHECK_NPM_SCRIPT =
  "check:commission-comparison-landing-p3-64" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_UNIT_TEST =
  "tests/unit/commission-comparison-landing-p3-64.test.ts" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_UPSTREAM_TEST =
  "tests/unit/commission-comparison-calculator-p2-46.test.ts" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH = COMMISSION_COMPARISON_LANDING_PATH;

export const COMMISSION_COMPARISON_LANDING_P3_64_PRIMARY_KEYWORD =
  "commission comparison calculator" as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_NPM_SCRIPTS = [
  "test:ci:commission-comparison-landing",
  "test:ci:commission-comparison-landing:cert",
] as const;

export const COMMISSION_COMPARISON_LANDING_P3_64_WIRING_PATHS = [
  COMMISSION_COMPARISON_LANDING_P3_64_DOC,
  "app/commission-comparison/page.tsx",
  "components/marketing/commission-comparison-landing.tsx",
  "lib/marketing/commission-comparison-landing-content.ts",
  "lib/marketing/commission-comparison-landing-audit.ts",
  "lib/marketing/commission-comparison-landing-p3-64-measurement.ts",
  "lib/marketing/commission-comparison-landing-p3-64-audit.ts",
  COMMISSION_COMPARISON_LANDING_P3_64_UNIT_TEST,
  COMMISSION_COMPARISON_LANDING_P3_64_ARTIFACT,
  "components/marketing/commission-comparison-calculator.tsx",
  "components/marketing/commission-comparison-doordash-panel.tsx",
] as const;

export function commissionComparisonLandingCanonicalPath(): string {
  return COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH;
}

export function commissionComparisonLandingPathsAligned(): boolean {
  return (
    COMMISSION_COMPARISON_LANDING_PATH === COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH &&
    COMMISSION_COMPARISON_LANDING_META.utmCampaign === "commission_comparison_seo"
  );
}
