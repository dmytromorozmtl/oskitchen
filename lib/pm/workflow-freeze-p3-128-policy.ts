/**
 * Blueprint P3-128 — Workflow freeze (no new script without PM approval).
 *
 * @see docs/workflow-freeze-policy.md
 */

export const WORKFLOW_FREEZE_POLICY_ID = "workflow-freeze-p3-128-v1" as const;

export const WORKFLOW_FREEZE_DOC = "docs/workflow-freeze-policy.md" as const;

export const WORKFLOW_FREEZE_REGISTRY_ARTIFACT =
  "artifacts/workflow-freeze-registry.json" as const;

export const WORKFLOW_FREEZE_AUDIT_SCRIPT =
  "scripts/audit-workflow-freeze-p3-128.ts" as const;

export const WORKFLOW_FREEZE_NPM_SCRIPT = "audit:workflow-freeze-p3-128" as const;

export const WORKFLOW_FREEZE_UNIT_TEST = "tests/unit/workflow-freeze-p3-128.test.ts" as const;

export const WORKFLOW_FREEZE_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const WORKFLOW_FREEZE_FROZEN_SURFACES = [
  "github_workflow",
  "npm_script",
  "script_file",
] as const;

export type WorkflowFreezeSurface = (typeof WORKFLOW_FREEZE_FROZEN_SURFACES)[number];

export const WORKFLOW_FREEZE_APPROVAL_STEPS = [
  "pm_request",
  "weekly_go_no_go_exception",
  "eng_lead_signoff",
  "registry_update",
  "same_pr_land",
] as const;

export type WorkflowFreezeApprovalStep = (typeof WORKFLOW_FREEZE_APPROVAL_STEPS)[number];

export const WORKFLOW_FREEZE_EXEMPT_CATEGORIES = [
  "bug_fix_existing",
  "test_only",
  "dependency_bump",
  "docs_only",
] as const;

export const WORKFLOW_FREEZE_RELATED_PATHS = [
  "docs/weekly-go-no-go-log.md",
  "artifacts/weekly-go-no-go-log.json",
  ".github/workflows/deploy-prod-gate.yml",
  "package.json",
] as const;

export const WORKFLOW_FREEZE_HONESTY_MARKERS = [
  "workflow freeze",
  "PM approval",
  "no new script",
  "halt workflow proliferation",
  "baseline",
] as const;

export const WORKFLOW_FREEZE_WIRING_PATHS = [
  WORKFLOW_FREEZE_DOC,
  "lib/pm/workflow-freeze-p3-128-policy.ts",
  "lib/pm/workflow-freeze-p3-128-operations.ts",
  "lib/pm/workflow-freeze-p3-128-audit.ts",
  WORKFLOW_FREEZE_REGISTRY_ARTIFACT,
  WORKFLOW_FREEZE_UNIT_TEST,
] as const;
