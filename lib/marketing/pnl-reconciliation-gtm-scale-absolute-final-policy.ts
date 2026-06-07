/**
 * Absolute Final Task 143 — P&L reconciliation view GTM scale (feature 98).
 *
 * @see docs/pnl-reconciliation-gtm-scale.md
 * @see components/dashboard/accounting/pnl-reconciliation-view-panel.tsx
 */

export const PNL_RECONCILIATION_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "pnl-reconciliation-gtm-scale-absolute-final-v1" as const;

export const PNL_RECONCILIATION_GTM_SCALE_DOC_PATH =
  "docs/pnl-reconciliation-gtm-scale.md" as const;

export const PNL_RECONCILIATION_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "operational P&L",
  "not a certified GL",
  "accountant review",
  "Do not claim",
  "sales-safe",
] as const;

export const PNL_RECONCILIATION_GTM_SCALE_WIRING_PATHS = [
  PNL_RECONCILIATION_GTM_SCALE_DOC_PATH,
  "components/dashboard/accounting/pnl-reconciliation-view-panel.tsx",
  "lib/accounting/pnl-reconciliation-view-absolute-final-policy.ts",
  "lib/marketing/pnl-reconciliation-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/pnl-reconciliation-gtm-scale-audit.ts",
  "tests/unit/pnl-reconciliation-view-absolute-final.test.ts",
] as const;
