/**
 * P3-77 — Archive GitHub workflows: 121 era theater → ≤40 canonical active.
 *
 * @see docs/archive-workflows-p3-77.md
 */

export const ARCHIVE_WORKFLOWS_P3_77_POLICY_ID = "archive-workflows-p3-77-v1" as const;

export const ARCHIVE_WORKFLOWS_P3_77_DOC = "docs/archive-workflows-p3-77.md" as const;

export const ARCHIVE_WORKFLOWS_P3_77_ARTIFACT = "artifacts/archive-workflows-p3-77.json" as const;

export const ARCHIVE_WORKFLOWS_P3_77_AUDIT_MODULE =
  "lib/devops/archive-workflows-p3-77-audit.ts" as const;

export const ARCHIVE_WORKFLOWS_P3_77_SCORING_MODULE =
  "lib/devops/archive-workflows-p3-77-scoring.ts" as const;

export const ARCHIVE_WORKFLOWS_P3_77_MAX_ACTIVE = 40 as const;

export const ARCHIVE_WORKFLOWS_P3_77_BASELINE_TOTAL = 121 as const;

export const ARCHIVE_WORKFLOWS_P3_77_MIN_ARCHIVED = 80 as const;

export const ARCHIVE_WORKFLOWS_P3_77_SCENARIO_COUNT = 6 as const;

export const ARCHIVE_WORKFLOWS_P3_77_CHECK_NPM_SCRIPT = "check:archive-workflows-p3-77" as const;

export const ARCHIVE_WORKFLOWS_P3_77_UNIT_TEST = "tests/unit/archive-workflows-p3-77.test.ts" as const;

export const ARCHIVE_WORKFLOWS_P3_77_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const ARCHIVE_WORKFLOWS_P3_77_UPSTREAM_POLICIES = [
  "github-workflow-archive-p1-17-v1",
] as const;

export const ARCHIVE_WORKFLOWS_P3_77_WIRING_PATHS = [
  ARCHIVE_WORKFLOWS_P3_77_DOC,
  ARCHIVE_WORKFLOWS_P3_77_ARTIFACT,
  ARCHIVE_WORKFLOWS_P3_77_AUDIT_MODULE,
  ARCHIVE_WORKFLOWS_P3_77_SCORING_MODULE,
  ARCHIVE_WORKFLOWS_P3_77_UNIT_TEST,
  ARCHIVE_WORKFLOWS_P3_77_CI_WORKFLOW,
  "lib/devops/github-workflow-archive-policy.ts",
  "scripts/archive-inactive-github-workflows.ts",
  "scripts/audit-github-workflow-surface.ts",
  ".github/archive/workflows/inactive/README.md",
  "artifacts/github-workflow-archive-manifest.json",
] as const;
