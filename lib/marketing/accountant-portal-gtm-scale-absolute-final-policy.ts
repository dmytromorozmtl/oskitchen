/**
 * Absolute Final Task 144 — accountant portal GTM scale (feature 99).
 *
 * @see docs/accountant-portal-gtm-scale.md
 * @see components/dashboard/accounting/accountant-portal-panel.tsx
 */

export const ACCOUNTANT_PORTAL_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "accountant-portal-gtm-scale-absolute-final-v1" as const;

export const ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH =
  "docs/accountant-portal-gtm-scale.md" as const;

export const ACCOUNTANT_PORTAL_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "read-only",
  "not a certified GL",
  "accountant review",
  "Do not claim",
  "sales-safe",
] as const;

export const ACCOUNTANT_PORTAL_GTM_SCALE_WIRING_PATHS = [
  ACCOUNTANT_PORTAL_GTM_SCALE_DOC_PATH,
  "components/dashboard/accounting/accountant-portal-panel.tsx",
  "lib/accounting/accountant-portal-absolute-final-policy.ts",
  "lib/marketing/accountant-portal-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/accountant-portal-gtm-scale-audit.ts",
  "tests/unit/accountant-portal-absolute-final.test.ts",
] as const;
