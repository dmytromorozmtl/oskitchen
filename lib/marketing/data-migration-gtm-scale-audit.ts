import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID,
  DATA_MIGRATION_WIZARD_CLIENT_PATH,
  DATA_MIGRATION_WIZARD_ROUTE,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import {
  DATA_MIGRATION_GTM_SCALE_DOC_PATH,
  DATA_MIGRATION_GTM_SCALE_HONESTY_MARKERS,
  DATA_MIGRATION_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/data-migration-gtm-scale-absolute-final-policy";

export type DataMigrationGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditDataMigrationGtmScaleWiring(root = process.cwd()): DataMigrationGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of DATA_MIGRATION_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, DATA_MIGRATION_GTM_SCALE_DOC_PATH), "utf8");
  const clientSource = readFileSync(join(root, DATA_MIGRATION_WIZARD_CLIENT_PATH), "utf8");

  for (const marker of DATA_MIGRATION_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(DATA_MIGRATION_WIZARD_CLIENT_PATH)) {
    failures.push("doc missing feature client path");
  }

  if (!docSource.includes(DATA_MIGRATION_WIZARD_ROUTE)) {
    failures.push("doc missing migration wizard route");
  }

  if (!docSource.includes("/dashboard/import-center")) {
    failures.push("doc missing Import Center link");
  }

  if (
    !clientSource.includes("DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID") &&
    !clientSource.includes(DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("client missing feature policy id");
  }

  if (!docSource.includes("data-migration-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
