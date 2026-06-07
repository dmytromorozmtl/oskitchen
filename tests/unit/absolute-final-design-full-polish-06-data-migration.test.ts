import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDesignFullPolishSlot } from "@/lib/design/absolute-final-design-full-polish-audit";
import {
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  getDesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_DARK_MODE_TOKENS,
  DESIGN_POLISH_TOKEN_NAMES,
} from "@/lib/design/absolute-final-design-polish-tokens";
import { auditDataMigrationWizardWiring } from "@/lib/import/data-migration-wizard-audit";
import {
  DATA_MIGRATION_ENTITIES,
  DATA_MIGRATION_HONESTY_MARKERS,
  DATA_MIGRATION_POS_SOURCES,
  DATA_MIGRATION_WIZARD_CLIENT_PATH,
  DATA_MIGRATION_WIZARD_PAGE_PATH,
  DATA_MIGRATION_WIZARD_STEPS,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 121 — Design full polish for feature 91 data migration wizard */
const TASK = 121;
const FEATURE = 91;

describe(`Design full polish — data migration wizard (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 121 → feature 91 data migration wizard", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("data-migration-wizard");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(DATA_MIGRATION_WIZARD_CLIENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the migration wizard client", () => {
    const client = readFileSync(join(ROOT, DATA_MIGRATION_WIZARD_CLIENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(client, `missing ${token}`).toContain(token);
    }
    expect(client).toContain("absolute-final-design-polish-tokens");
    expect(client).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on wizard interactive surfaces", () => {
    const client = readFileSync(join(ROOT, DATA_MIGRATION_WIZARD_CLIENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(client).toContain("dark:text-muted-foreground/90");
    expect(client).toContain("dark:border-border/60");
    expect(client).toContain("dark:bg-background/95");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with CSV export and manual review honesty", () => {
    const client = readFileSync(join(ROOT, DATA_MIGRATION_WIZARD_CLIENT_PATH), "utf8");
    for (const marker of DATA_MIGRATION_HONESTY_MARKERS) {
      expect(client).toContain(marker);
    }
    expect(client).toContain("Toast, Square, or Lightspeed");
    expect(client).toContain('role="note"');
  });

  it("wires migrate page and preserves wizard step flow", () => {
    const page = readFileSync(join(ROOT, DATA_MIGRATION_WIZARD_PAGE_PATH), "utf8");
    expect(page).toContain("MigrationWizardClient");
    expect(DATA_MIGRATION_WIZARD_STEPS).toEqual(["pick", "preview", "upload"]);
    expect(DATA_MIGRATION_POS_SOURCES).toHaveLength(3);
    expect(DATA_MIGRATION_ENTITIES).toHaveLength(3);
  });

  it("preserves wizard test ids and preview mapping wiring after polish", () => {
    const client = readFileSync(join(ROOT, DATA_MIGRATION_WIZARD_CLIENT_PATH), "utf8");
    expect(client).toContain('data-testid="data-migration-wizard"');
    expect(client).toContain("data-migration-source-");
    expect(client).toContain("data-migration-entity-");
    expect(client).toContain("data-migration-wizard-progress");
    expect(client).toContain("data-migration-continue-upload");
    expect(client).toContain("previewPosMigrationMapping");
    expect(client).toContain("Rollback draft");
  });

  it("passes base data migration wiring audit after component polish", () => {
    const wiring = auditDataMigrationWizardWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
    expect(wiring.profileCount).toBe(9);
  });

  it("passes design polish slot 121 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-06-data-migration.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
