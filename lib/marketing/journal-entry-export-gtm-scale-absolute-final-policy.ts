/**
 * Absolute Final Task 142 — journal entry export GTM scale (feature 97).
 *
 * @see docs/journal-entry-export-gtm-scale.md
 * @see components/dashboard/accounting/journal-entry-export-panel.tsx
 */

export const JOURNAL_ENTRY_EXPORT_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "journal-entry-export-gtm-scale-absolute-final-v1" as const;

export const JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH =
  "docs/journal-entry-export-gtm-scale.md" as const;

export const JOURNAL_ENTRY_EXPORT_GTM_SCALE_HONESTY_MARKERS = [
  "BETA",
  "accountant review",
  "not a certified GL",
  "QuickBooks",
  "Do not claim",
  "sales-safe",
] as const;

export const JOURNAL_ENTRY_EXPORT_GTM_SCALE_WIRING_PATHS = [
  JOURNAL_ENTRY_EXPORT_GTM_SCALE_DOC_PATH,
  "components/dashboard/accounting/journal-entry-export-panel.tsx",
  "lib/accounting/journal-entry-export-absolute-final-policy.ts",
  "lib/marketing/journal-entry-export-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/journal-entry-export-gtm-scale-audit.ts",
  "tests/unit/journal-entry-export-absolute-final.test.ts",
] as const;
