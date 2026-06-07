import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDataMigrationWizardWiring } from "@/lib/import/data-migration-wizard-audit";
import { DATA_MIGRATION_PROFILES } from "@/lib/import/data-migration-profiles";
import {
  DATA_MIGRATION_ENTITIES,
  DATA_MIGRATION_POS_SOURCES,
  DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID,
  DATA_MIGRATION_WIZARD_CI_SCRIPTS,
  DATA_MIGRATION_WIZARD_ROUTE,
  DATA_MIGRATION_WIZARD_UNIT_TEST,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import {
  previewPosMigrationMapping,
  POS_MIGRATION_SOURCES,
} from "@/services/import/migration-service";

const ROOT = process.cwd();

describe("Data migration wizard (Absolute Final Task 72)", () => {
  it("locks absolute final policy with three POS sources and three entities", () => {
    expect(DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "data-migration-wizard-absolute-final-v1",
    );
    expect(DATA_MIGRATION_WIZARD_ROUTE).toBe("/dashboard/import-center/migrate");
    expect(DATA_MIGRATION_POS_SOURCES).toEqual(["toast", "square", "lightspeed"]);
    expect(DATA_MIGRATION_ENTITIES).toEqual(["menu", "customers", "orders"]);
    expect(POS_MIGRATION_SOURCES).toEqual(["toast", "square", "lightspeed"]);
  });

  it("defines nine POS migration profiles (3×3)", () => {
    expect(DATA_MIGRATION_PROFILES).toHaveLength(9);
    for (const source of DATA_MIGRATION_POS_SOURCES) {
      for (const entity of DATA_MIGRATION_ENTITIES) {
        expect(DATA_MIGRATION_PROFILES.some((p) => p.source === source && p.entity === entity)).toBe(
          true,
        );
      }
    }
  });

  it("maps Toast menu CSV rows to product fields", () => {
    const preview = previewPosMigrationMapping("toast", "menu", [
      { menu_item: "Burger", price: "12.99", category: "Entrees", allergens: "gluten" },
    ]);
    expect(preview.rows[0]?.mapped["product.title"]).toBe("Burger");
    expect(preview.rows[0]?.mapped["product.price"]).toBe("12.99");
  });

  it("maps Square customer CSV rows", () => {
    const preview = previewPosMigrationMapping("square", "customers", [
      {
        "Email Address": "a@b.com",
        "First Name": "Pat",
        "Last Name": "Lee",
        "Phone Number": "555",
      },
    ]);
    expect(preview.rows[0]?.mapped["customer.email"]).toBe("a@b.com");
  });

  it("maps Lightspeed order CSV rows", () => {
    const preview = previewPosMigrationMapping("lightspeed", "orders", [
      {
        sale_id: "ls-1",
        completed_at: "2026-06-01",
        total: "10",
        customer_email: "x@y.com",
      },
    ]);
    expect(preview.rows[0]?.mapped["order.externalId"]).toBe("ls-1");
  });

  it("passes wiring audit", () => {
    const audit = auditDataMigrationWizardWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.profileCount).toBe(9);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of DATA_MIGRATION_WIZARD_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(DATA_MIGRATION_WIZARD_UNIT_TEST).toBe(
      "tests/unit/data-migration-wizard-absolute-final.test.ts",
    );
  });
});
