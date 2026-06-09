/**
 * Blueprint P1-34 — migration health checker (schema vs deployed DB).
 */

export const MIGRATION_HEALTH_POLICY_ID = "migration-health-checker-v1" as const;

export const MIGRATION_HEALTH_SCRIPT = "scripts/check-migration-health.ts" as const;

export const MIGRATION_HEALTH_NPM_SCRIPT = "check:migration-health" as const;

export const MIGRATION_HEALTH_UNIT_TEST =
  "tests/unit/migration-health-checker.test.ts" as const;

export const MIGRATION_HEALTH_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

/** DDL tokens that indicate prod DB drift from prisma/schema.prisma. */
export const MIGRATION_DRIFT_DDL_PATTERN =
  /^\s*(CREATE|ALTER|DROP|RENAME)\s+/im;

export function migrationDiffIndicatesDrift(scriptOutput: string): boolean {
  const trimmed = scriptOutput.trim();
  if (!trimmed) return false;
  if (/no difference detected/i.test(trimmed)) return false;
  return MIGRATION_DRIFT_DDL_PATTERN.test(trimmed);
}
