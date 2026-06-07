/**
 * Absolute Final Task 72 — data migration wizard from Toast, Square, Lightspeed.
 *
 * @see app/dashboard/import-center/migrate/page.tsx
 * @see services/import/migration-service.ts
 */

export const DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID =
  "data-migration-wizard-absolute-final-v1" as const;

export const DATA_MIGRATION_WIZARD_ROUTE = "/dashboard/import-center/migrate" as const;

export const DATA_MIGRATION_WIZARD_PAGE_PATH =
  "app/dashboard/import-center/migrate/page.tsx" as const;

export const DATA_MIGRATION_WIZARD_CLIENT_PATH =
  "components/import/migration-wizard-client.tsx" as const;

export const DATA_MIGRATION_WIZARD_SERVICE_PATH = "services/import/migration-service.ts" as const;

export const DATA_MIGRATION_WIZARD_PROFILES_PATH = "lib/import/data-migration-profiles.ts" as const;

export const DATA_MIGRATION_POS_SOURCES = ["toast", "square", "lightspeed"] as const;

export type DataMigrationPosSource = (typeof DATA_MIGRATION_POS_SOURCES)[number];

export const DATA_MIGRATION_ENTITIES = ["menu", "customers", "orders"] as const;

export type DataMigrationEntity = (typeof DATA_MIGRATION_ENTITIES)[number];

export const DATA_MIGRATION_WIZARD_STEPS = ["pick", "preview", "upload"] as const;

export const DATA_MIGRATION_UPLOAD_ROUTE = "/dashboard/import-center/upload" as const;

export const DATA_MIGRATION_HONESTY_MARKERS = [
  "CSV export",
  "not live API",
  "BETA",
  "manual review",
] as const;

export const DATA_MIGRATION_WIZARD_WIRING_PATHS = [
  DATA_MIGRATION_WIZARD_PAGE_PATH,
  DATA_MIGRATION_WIZARD_CLIENT_PATH,
  DATA_MIGRATION_WIZARD_SERVICE_PATH,
  DATA_MIGRATION_WIZARD_PROFILES_PATH,
  "lib/import/data-migration-wizard-absolute-final-policy.ts",
  "lib/import/data-migration-wizard-audit.ts",
  "tests/unit/data-migration-wizard-absolute-final.test.ts",
  "lib/import/templates/toast-menu.csv",
  "lib/import/templates/square-menu.csv",
  "lib/import/templates/lightspeed-menu.csv",
] as const;

export const DATA_MIGRATION_WIZARD_UNIT_TEST =
  "tests/unit/data-migration-wizard-absolute-final.test.ts" as const;

export const DATA_MIGRATION_WIZARD_CI_SCRIPTS = [
  "test:ci:data-migration-wizard",
  "test:ci:data-migration-wizard:cert",
] as const;

export function migrationProfileKey(
  source: DataMigrationPosSource,
  entity: DataMigrationEntity,
): `${DataMigrationPosSource}:${DataMigrationEntity}` {
  return `${source}:${entity}`;
}
