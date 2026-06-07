/**
 * Absolute Final Task 141 — chart of accounts mapping GTM scale (feature 96).
 *
 * @see docs/chart-of-accounts-gtm-scale.md
 * @see components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx
 */

export const CHART_OF_ACCOUNTS_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "chart-of-accounts-gtm-scale-absolute-final-v1" as const;

export const CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH =
  "docs/chart-of-accounts-gtm-scale.md" as const;

export const CHART_OF_ACCOUNTS_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "not a certified GL",
  "accountant review",
  "QuickBooks",
  "Do not claim",
  "sales-safe",
] as const;

export const CHART_OF_ACCOUNTS_GTM_SCALE_WIRING_PATHS = [
  CHART_OF_ACCOUNTS_GTM_SCALE_DOC_PATH,
  "components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx",
  "lib/accounting/chart-of-accounts-mapping-absolute-final-policy.ts",
  "lib/marketing/chart-of-accounts-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/chart-of-accounts-gtm-scale-audit.ts",
  "tests/unit/chart-of-accounts-mapping-absolute-final.test.ts",
] as const;
