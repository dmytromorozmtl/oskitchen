import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDataMigrationWizardWiring } from "@/lib/import/data-migration-wizard-audit";
import {
  DATA_MIGRATION_ENTITIES,
  DATA_MIGRATION_HONESTY_MARKERS,
  DATA_MIGRATION_POS_SOURCES,
  DATA_MIGRATION_UPLOAD_ROUTE,
  DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID,
  DATA_MIGRATION_WIZARD_P3_TASK_ID,
  DATA_MIGRATION_WIZARD_ROUTE,
  DATA_MIGRATION_WIZARD_STEPS,
  migrationProfileKey,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import {
  DATA_MIGRATION_PROFILES,
  getDataMigrationProfile,
  listProfilesForSource,
} from "@/lib/import/data-migration-profiles";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";
import {
  buildMigrationUploadQuery,
  previewPosMigrationMapping,
} from "@/services/import/migration-service";

const ROOT = process.cwd();
/** Absolute Final Task 106 — QA full coverage for feature 91 data migration wizard */
const TASK = 106;
const FEATURE = 91;

describe(`QA full coverage — data migration wizard (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 106 → feature 91 Toast/Square/Lightspeed wizard", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("data-migration-wizard");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/data-migration-wizard-absolute-final.test.ts");
    expect(DATA_MIGRATION_WIZARD_P3_TASK_ID).toBe("91-data-migration-wizard");
    expect(DATA_MIGRATION_WIZARD_ROUTE).toBe("/dashboard/import-center/migrate");
    expect(DATA_MIGRATION_WIZARD_STEPS).toEqual(["pick", "preview", "upload"]);
  });

  it("builds stable profile keys and lists three entities per POS source", () => {
    expect(migrationProfileKey("toast", "menu")).toBe("toast:menu");
    for (const source of DATA_MIGRATION_POS_SOURCES) {
      const profiles = listProfilesForSource(source);
      expect(profiles).toHaveLength(3);
      for (const entity of DATA_MIGRATION_ENTITIES) {
        expect(getDataMigrationProfile(source, entity)?.exportHint.length).toBeGreaterThan(10);
      }
    }
    expect(DATA_MIGRATION_PROFILES).toHaveLength(9);
  });

  it("previews mapping and surfaces unmapped columns for manual review", () => {
    const preview = previewPosMigrationMapping("square", "menu", [
      { Name: "Latte", Price: "4.50", Category: "Drinks", Extra: "ignored" },
    ]);
    expect(preview.rows[0]?.mapped["product.title"]).toBeDefined();
    expect(preview.unmappedColumns).toContain("Extra");
    expect(preview.exportHint).toContain("Square");
  });

  it("builds upload query for Import Center handoff", () => {
    expect(buildMigrationUploadQuery("lightspeed", "orders")).toBe(
      "?source=lightspeed&entity=orders",
    );
    expect(`${DATA_MIGRATION_UPLOAD_ROUTE}${buildMigrationUploadQuery("toast", "customers")}`).toBe(
      "/dashboard/import-center/upload?source=toast&entity=customers",
    );
  });

  it("documents honesty markers — CSV export, not live API, manual review", () => {
    const client = readFileSync(
      join(ROOT, "components/import/migration-wizard-client.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/import-center/data-migration-wizard-strip.tsx"),
      "utf8",
    );
    const combined = `${client}\n${strip}`;
    for (const marker of DATA_MIGRATION_HONESTY_MARKERS) {
      expect(combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase())).toBe(
        true,
      );
    }
    expect(client).toContain("DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("wires wizard client steps, source/entity selectors, and upload continue link", () => {
    const client = readFileSync(
      join(ROOT, "components/import/migration-wizard-client.tsx"),
      "utf8",
    );
    expect(client).toContain('data-testid="data-migration-wizard"');
    expect(client).toContain("data-migration-source-");
    expect(client).toContain("data-migration-entity-");
    expect(client).toContain("data-migration-wizard-progress");
    expect(client).toContain("data-migration-continue-upload");
    expect(client).toContain("previewPosMigrationMapping");
    expect(client).toContain("Rollback draft");
  });

  it("wires migrate page, strip, and nine CSV templates", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/import-center/migrate/page.tsx"), "utf8");
    const importCenter = readFileSync(join(ROOT, "app/dashboard/import-center/page.tsx"), "utf8");
    expect(page).toContain("MigrationWizardClient");
    expect(page).toContain("Toast");
    expect(page).toContain("Square");
    expect(page).toContain("Lightspeed");
    expect(importCenter).toContain("DataMigrationWizardStrip");
    for (const source of DATA_MIGRATION_POS_SOURCES) {
      for (const entity of DATA_MIGRATION_ENTITIES) {
        expect(
          readFileSync(join(ROOT, `lib/import/templates/${source}-${entity}.csv`), "utf8").length,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("passes base wiring audit and QA slot 106 audit gate", () => {
    const wiring = auditDataMigrationWizardWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
    expect(wiring.profileCount).toBe(9);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-06-data-migration.test.ts",
    );
    expect(DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "data-migration-wizard-absolute-final-v1",
    );
  });
});
