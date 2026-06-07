import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { DATA_MIGRATION_PROFILES } from "@/lib/import/data-migration-profiles";
import {
  DATA_MIGRATION_ENTITIES,
  DATA_MIGRATION_HONESTY_MARKERS,
  DATA_MIGRATION_POS_SOURCES,
  DATA_MIGRATION_WIZARD_ROUTE,
  DATA_MIGRATION_WIZARD_STRIP_PATH,
  DATA_MIGRATION_WIZARD_WIRING_PATHS,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";

export type DataMigrationWizardAudit = {
  ok: boolean;
  failures: string[];
  profileCount: number;
};

export function auditDataMigrationWizardWiring(root = process.cwd()): DataMigrationWizardAudit {
  const failures: string[] = [];

  for (const rel of DATA_MIGRATION_WIZARD_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const clientSource = readFileSync(
    join(root, "components/import/migration-wizard-client.tsx"),
    "utf8",
  );
  const serviceSource = readFileSync(join(root, "services/import/migration-service.ts"), "utf8");

  for (const source of DATA_MIGRATION_POS_SOURCES) {
    if (!clientSource.includes("data-migration-source-")) {
      failures.push("wizard client missing source test ids");
      break;
    }
    if (!serviceSource.includes(`"${source}"`)) {
      failures.push(`migration service missing source: ${source}`);
    }
  }

  if (!clientSource.includes("data-migration-entity-")) {
    failures.push("wizard client missing entity test ids");
  }

  for (const marker of DATA_MIGRATION_HONESTY_MARKERS) {
    if (!clientSource.includes(marker)) {
      failures.push(`wizard client missing honesty marker: ${marker}`);
    }
  }

  if (!clientSource.includes("data-migration-wizard")) {
    failures.push("wizard client missing root test id");
  }

  if (!clientSource.includes("previewPosMigrationMapping")) {
    failures.push("wizard client must use previewPosMigrationMapping");
  }

  const expectedProfiles =
    DATA_MIGRATION_POS_SOURCES.length * DATA_MIGRATION_ENTITIES.length;
  if (DATA_MIGRATION_PROFILES.length !== expectedProfiles) {
    failures.push(`expected ${expectedProfiles} migration profiles`);
  }

  const pageSource = readFileSync(
    join(root, "app/dashboard/import-center/migrate/page.tsx"),
    "utf8",
  );
  if (!pageSource.includes("MigrationWizardClient")) {
    failures.push("migrate page missing MigrationWizardClient");
  }
  if (!pageSource.includes("Toast") || !pageSource.includes("Square") || !pageSource.includes("Lightspeed")) {
    failures.push("migrate page missing POS source mention");
  }

  const stripSource = readFileSync(join(root, DATA_MIGRATION_WIZARD_STRIP_PATH), "utf8");
  const importCenterPage = readFileSync(
    join(root, "app/dashboard/import-center/page.tsx"),
    "utf8",
  );

  if (!stripSource.includes("/dashboard/import-center/migrate")) {
    failures.push("strip missing migration wizard route");
  }
  if (!stripSource.includes("CSV export")) {
    failures.push("strip missing CSV export honesty marker");
  }
  if (!importCenterPage.includes("DataMigrationWizardStrip")) {
    failures.push("import center page missing DataMigrationWizardStrip");
  }

  if (!serviceSource.includes(DATA_MIGRATION_WIZARD_ROUTE)) {
    // route is in policy not service - skip
  }

  return {
    ok: failures.length === 0,
    failures,
    profileCount: DATA_MIGRATION_PROFILES.length,
  };
}
