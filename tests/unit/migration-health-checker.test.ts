import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MIGRATION_HEALTH_CI_WORKFLOW,
  MIGRATION_HEALTH_NPM_SCRIPT,
  MIGRATION_HEALTH_POLICY_ID,
  MIGRATION_HEALTH_SCRIPT,
  MIGRATION_HEALTH_UNIT_TEST,
  migrationDiffIndicatesDrift,
} from "@/lib/devops/migration-health-policy";

const ROOT = process.cwd();

describe("migration health checker (P1-34)", () => {
  it("locks policy id and script paths", () => {
    expect(MIGRATION_HEALTH_POLICY_ID).toBe("migration-health-checker-v1");
    expect(existsSync(join(ROOT, MIGRATION_HEALTH_SCRIPT))).toBe(true);
    expect(MIGRATION_HEALTH_UNIT_TEST).toBe(
      "tests/unit/migration-health-checker.test.ts",
    );
  });

  it("detects DDL drift in migrate diff script output", () => {
    expect(migrationDiffIndicatesDrift("")).toBe(false);
    expect(migrationDiffIndicatesDrift("No difference detected.")).toBe(false);
    expect(
      migrationDiffIndicatesDrift('ALTER TABLE "Order" ADD COLUMN "foo" TEXT;'),
    ).toBe(true);
    expect(migrationDiffIndicatesDrift("CREATE INDEX idx ON foo (id);")).toBe(true);
  });

  it("registers npm script and deploy-prod-gate CI step", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MIGRATION_HEALTH_NPM_SCRIPT]).toContain(
      "check-migration-health.ts",
    );

    const workflow = readFileSync(join(ROOT, MIGRATION_HEALTH_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("check:migration-health");
  });
});
