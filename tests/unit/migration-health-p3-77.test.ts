import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditMigrationHealthWiring } from "@/lib/devops/migration-health-audit";
import {
  auditMigrationHealthP3_77,
  formatMigrationHealthP3_77AuditLines,
} from "@/lib/devops/migration-health-p3-77-audit";
import { validateMigrationHealthContract } from "@/lib/devops/migration-health-p3-77-measurement";
import {
  MIGRATION_HEALTH_P3_77_AUDIT_SCRIPT,
  MIGRATION_HEALTH_P3_77_CHECK_NPM_SCRIPT,
  MIGRATION_HEALTH_P3_77_DOC,
  MIGRATION_HEALTH_P3_77_NPM_SCRIPT,
  MIGRATION_HEALTH_P3_77_NPM_SCRIPTS,
  MIGRATION_HEALTH_P3_77_POLICY_ID,
  MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW,
  MIGRATION_HEALTH_P3_77_UNIT_TEST,
  MIGRATION_HEALTH_P3_77_UPSTREAM_POLICY_ID,
  MIGRATION_HEALTH_P3_77_UPSTREAM_TEST,
} from "@/lib/devops/migration-health-p3-77-policy";

const ROOT = process.cwd();

describe("Migration health checker (P3-77)", () => {
  it("locks P3-77 policy and prod drift workflow", () => {
    expect(MIGRATION_HEALTH_P3_77_POLICY_ID).toBe("migration-health-p3-77-v1");
    expect(MIGRATION_HEALTH_P3_77_UPSTREAM_POLICY_ID).toBe("migration-health-checker-v1");
    expect(existsSync(join(ROOT, MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW))).toBe(true);
  });

  it("validates upstream wiring + prod drift workflow", () => {
    const validation = validateMigrationHealthContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamWiringOk).toBe(true);
    expect(validation.prodDriftWorkflowWired).toBe(true);
  });

  it("passes full migration health P3-77 audit", () => {
    const summary = auditMigrationHealthP3_77(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatMigrationHealthP3_77AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, MIGRATION_HEALTH_P3_77_DOC))).toBe(true);
    expect(existsSync(join(ROOT, MIGRATION_HEALTH_P3_77_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MIGRATION_HEALTH_P3_77_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, MIGRATION_HEALTH_P3_77_UPSTREAM_TEST))).toBe(true);

    const upstream = auditMigrationHealthWiring(ROOT);
    expect(upstream.passed).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MIGRATION_HEALTH_P3_77_NPM_SCRIPT]).toContain(
      "audit-migration-health-p3-77.ts",
    );
    expect(pkg.scripts?.[MIGRATION_HEALTH_P3_77_CHECK_NPM_SCRIPT]).toContain(
      MIGRATION_HEALTH_P3_77_UNIT_TEST,
    );
    for (const script of MIGRATION_HEALTH_P3_77_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
