/**
 * P2-46 — npm audit CI gate: block merge on high/critical dependency vulnerabilities.
 *
 * @see docs/npm-audit-gate-p2-46.md
 * @see artifacts/npm-audit-gate-p2-46.json
 */

export const NPM_AUDIT_GATE_P2_46_POLICY_ID = "npm-audit-gate-p2-46-v1" as const;

export const NPM_AUDIT_GATE_P2_46_DOC = "docs/npm-audit-gate-p2-46.md" as const;

export const NPM_AUDIT_GATE_P2_46_ARTIFACT = "artifacts/npm-audit-gate-p2-46.json" as const;

export const NPM_AUDIT_GATE_P2_46_AUDIT_MODULE = "lib/devops/npm-audit-gate-p2-46-audit.ts" as const;

export const NPM_AUDIT_GATE_P2_46_CHECK_NPM_SCRIPT = "check:npm-audit-gate-p2-46" as const;

export const NPM_AUDIT_GATE_P2_46_CI_NPM_SCRIPT = "test:ci:npm-audit-gate-p2-46" as const;

export const NPM_AUDIT_GATE_P2_46_UNIT_TEST = "tests/unit/npm-audit-gate-p2-46.test.ts" as const;

export const NPM_AUDIT_GATE_P2_46_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const NPM_AUDIT_GATE_P2_46_DEPLOY_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT = "audit:dependencies:high" as const;

export const NPM_AUDIT_GATE_P2_46_AUDIT_COMMAND = "npm audit --audit-level=high" as const;

export const NPM_AUDIT_GATE_P2_46_CI_STEP_NAME = "Dependency audit (high severity gate)" as const;

export const NPM_AUDIT_GATE_P2_46_WIRING_PATHS = [
  NPM_AUDIT_GATE_P2_46_DOC,
  NPM_AUDIT_GATE_P2_46_ARTIFACT,
  NPM_AUDIT_GATE_P2_46_AUDIT_MODULE,
  NPM_AUDIT_GATE_P2_46_UNIT_TEST,
  NPM_AUDIT_GATE_P2_46_CI_WORKFLOW,
  NPM_AUDIT_GATE_P2_46_DEPLOY_WORKFLOW,
  "config/npm-scripts/archive-v1.json",
] as const;
