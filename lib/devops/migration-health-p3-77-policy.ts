/**
 * Blueprint P3-77 — Migration health checker (CI diff prod vs prisma).
 *
 * @see docs/migration-health-p3-77.md
 */

import {
  MIGRATION_HEALTH_NPM_SCRIPT,
  MIGRATION_HEALTH_POLICY_ID,
  MIGRATION_HEALTH_SCRIPT,
  MIGRATION_HEALTH_UNIT_TEST,
} from "@/lib/devops/migration-health-policy";

export const MIGRATION_HEALTH_P3_77_POLICY_ID = "migration-health-p3-77-v1" as const;

export const MIGRATION_HEALTH_P3_77_DOC = "docs/migration-health-p3-77.md" as const;

export const MIGRATION_HEALTH_P3_77_ARTIFACT =
  "artifacts/migration-health-p3-77-registry.json" as const;

export const MIGRATION_HEALTH_P3_77_AUDIT_SCRIPT =
  "scripts/audit-migration-health-p3-77.ts" as const;

export const MIGRATION_HEALTH_P3_77_NPM_SCRIPT = "audit:migration-health-p3-77" as const;

export const MIGRATION_HEALTH_P3_77_CHECK_NPM_SCRIPT =
  "check:migration-health-p3-77" as const;

export const MIGRATION_HEALTH_P3_77_UNIT_TEST =
  "tests/unit/migration-health-p3-77.test.ts" as const;

export const MIGRATION_HEALTH_P3_77_UPSTREAM_POLICY_ID = MIGRATION_HEALTH_POLICY_ID;

export const MIGRATION_HEALTH_P3_77_UPSTREAM_TEST = MIGRATION_HEALTH_UNIT_TEST;

/** Scheduled / manual workflow — prod DIRECT_URL vs prisma/schema.prisma. */
export const MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW =
  ".github/workflows/migration-health-prod-drift.yml" as const;

export const MIGRATION_HEALTH_P3_77_NPM_SCRIPTS = [
  "test:ci:migration-health-checker",
  "test:ci:migration-health-p3-77:cert",
  MIGRATION_HEALTH_NPM_SCRIPT,
] as const;

export const MIGRATION_HEALTH_P3_77_WIRING_PATHS = [
  MIGRATION_HEALTH_P3_77_DOC,
  MIGRATION_HEALTH_SCRIPT,
  "lib/devops/migration-health-audit.ts",
  "lib/devops/migration-health-p3-77-measurement.ts",
  "lib/devops/migration-health-p3-77-audit.ts",
  MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW,
  MIGRATION_HEALTH_P3_77_UNIT_TEST,
  MIGRATION_HEALTH_P3_77_UPSTREAM_TEST,
  MIGRATION_HEALTH_P3_77_ARTIFACT,
  "prisma/schema.prisma",
] as const;
