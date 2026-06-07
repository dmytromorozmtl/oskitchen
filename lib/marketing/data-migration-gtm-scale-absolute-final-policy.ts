/**
 * Absolute Final Task 136 — data migration wizard GTM scale (feature 91).
 *
 * @see docs/data-migration-gtm-scale.md
 * @see components/import/migration-wizard-client.tsx
 */

export const DATA_MIGRATION_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "data-migration-gtm-scale-absolute-final-v1" as const;

export const DATA_MIGRATION_GTM_SCALE_DOC_PATH = "docs/data-migration-gtm-scale.md" as const;

export const DATA_MIGRATION_GTM_SCALE_HONESTY_MARKERS = [
  "CSV export",
  "not live API",
  "BETA",
  "manual review",
  "sales-safe",
] as const;

export const DATA_MIGRATION_GTM_SCALE_WIRING_PATHS = [
  DATA_MIGRATION_GTM_SCALE_DOC_PATH,
  "components/import/migration-wizard-client.tsx",
  "lib/import/data-migration-wizard-absolute-final-policy.ts",
  "lib/marketing/data-migration-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/data-migration-gtm-scale-audit.ts",
  "tests/unit/data-migration-wizard-absolute-final.test.ts",
] as const;
