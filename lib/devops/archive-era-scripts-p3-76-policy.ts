/**
 * P3-76 — Archive era npm scripts: 1902+ sprawl → <500 active via archive + routers.
 *
 * @see docs/archive-era-scripts-p3-76.md
 */

export const ARCHIVE_ERA_SCRIPTS_P3_76_POLICY_ID = "archive-era-scripts-p3-76-v1" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_DOC = "docs/archive-era-scripts-p3-76.md" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_ARTIFACT =
  "artifacts/archive-era-scripts-p3-76.json" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_AUDIT_MODULE =
  "lib/devops/archive-era-scripts-p3-76-audit.ts" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_SCORING_MODULE =
  "lib/devops/archive-era-scripts-p3-76-scoring.ts" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS = 500 as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_SCENARIO_COUNT = 6 as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_BASELINE_SCRIPT_COUNT = 1902 as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_CHECK_NPM_SCRIPT = "check:archive-era-scripts-p3-76" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_CI_NPM_SCRIPT =
  "test:ci:archive-era-scripts-p3-76" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_UNIT_TEST =
  "tests/unit/archive-era-scripts-p3-76.test.ts" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_CONSOLIDATE_SCRIPT =
  "scripts/consolidate-npm-scripts.ts" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_ROUTER_SCRIPT = "scripts/npm-script-router.ts" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_ARCHIVE_PATH = "config/npm-scripts/archive-v1.json" as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_UPSTREAM_POLICIES = [
  "npm-script-consolidation-p1-16-v1",
] as const;

export const ARCHIVE_ERA_SCRIPTS_P3_76_WIRING_PATHS = [
  ARCHIVE_ERA_SCRIPTS_P3_76_DOC,
  ARCHIVE_ERA_SCRIPTS_P3_76_ARTIFACT,
  ARCHIVE_ERA_SCRIPTS_P3_76_AUDIT_MODULE,
  ARCHIVE_ERA_SCRIPTS_P3_76_SCORING_MODULE,
  ARCHIVE_ERA_SCRIPTS_P3_76_UNIT_TEST,
  ARCHIVE_ERA_SCRIPTS_P3_76_CI_WORKFLOW,
  ARCHIVE_ERA_SCRIPTS_P3_76_CONSOLIDATE_SCRIPT,
  ARCHIVE_ERA_SCRIPTS_P3_76_ROUTER_SCRIPT,
  ARCHIVE_ERA_SCRIPTS_P3_76_ARCHIVE_PATH,
  "lib/devops/npm-script-consolidation-policy.ts",
] as const;

/** Era script name pattern — archived, not in active package.json surface. */
export const ARCHIVE_ERA_SCRIPTS_P3_76_ERA_PATTERN = /era[0-9]+/i;
