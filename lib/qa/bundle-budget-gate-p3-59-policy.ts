/**
 * Blueprint P3-59 — Bundle budget CI gate (fail when First Load JS > 1000 kB).
 *
 * @see scripts/check-bundle-size-regression.ts
 * @see docs/bundle-budget-gate-p3-59.md
 */

import {
  BUNDLE_FIRST_LOAD_FAIL_KB,
  BUNDLE_FIRST_LOAD_WARN_KB,
  BUNDLE_SIZE_BASELINE_ARTIFACT,
  BUNDLE_SIZE_BUDGET_POLICY_ID,
} from "@/lib/performance/bundle-size-budget-policy";

export const BUNDLE_BUDGET_GATE_P3_59_POLICY_ID = "bundle-budget-gate-p3-59-v1" as const;

export const BUNDLE_BUDGET_GATE_P3_59_DOC = "docs/bundle-budget-gate-p3-59.md" as const;

export const BUNDLE_BUDGET_GATE_P3_59_ARTIFACT =
  "artifacts/bundle-budget-gate-p3-59-registry.json" as const;

export const BUNDLE_BUDGET_GATE_P3_59_CHECK_SCRIPT =
  "scripts/check-bundle-size-regression.ts" as const;

export const BUNDLE_BUDGET_GATE_P3_59_AUDIT_SCRIPT =
  "scripts/audit-bundle-budget-gate-p3-59.ts" as const;

export const BUNDLE_BUDGET_GATE_P3_59_E2E_SPEC = "e2e/bundle-budget-gate-p3-59.spec.ts" as const;

export const BUNDLE_BUDGET_GATE_P3_59_FLOW_HELPER =
  "e2e/helpers/bundle-budget-gate-p3-59-flow.ts" as const;

export const BUNDLE_BUDGET_GATE_P3_59_READY_HELPER =
  "e2e/helpers/bundle-budget-gate-p3-59-ready.ts" as const;

export const BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPT = "audit:bundle-budget-gate-p3-59" as const;

export const BUNDLE_BUDGET_GATE_P3_59_CHECK_NPM_SCRIPT = "check:bundle-budget-gate-p3-59" as const;

export const BUNDLE_BUDGET_GATE_P3_59_UNIT_TEST =
  "tests/unit/bundle-budget-gate-p3-59.test.ts" as const;

export const BUNDLE_BUDGET_GATE_P3_59_UPSTREAM_TEST =
  "tests/unit/bundle-size-regression.test.ts" as const;

export const BUNDLE_BUDGET_GATE_P3_59_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const BUNDLE_BUDGET_GATE_P3_59_DEPLOY_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const BUNDLE_BUDGET_GATE_P3_59_BUILD_LOG = "artifacts/build-route-sizes.log" as const;

export const BUNDLE_BUDGET_GATE_P3_59_UPSTREAM_POLICY_ID = BUNDLE_SIZE_BUDGET_POLICY_ID;

export const BUNDLE_BUDGET_GATE_P3_59_FAIL_KB = BUNDLE_FIRST_LOAD_FAIL_KB;

export const BUNDLE_BUDGET_GATE_P3_59_WARN_KB = BUNDLE_FIRST_LOAD_WARN_KB;

export const BUNDLE_BUDGET_GATE_P3_59_FLOW_STEPS = [
  "validate_bundle_budget_contract",
  "parse_build_log_sizes",
  "check_baseline_regression",
  "enforce_1000kb_fail_gate",
] as const;

export const BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPTS = [
  "check:bundle-size-regression",
  "test:ci:bundle-size-regression",
] as const;

export const BUNDLE_BUDGET_GATE_P3_59_WIRING_PATHS = [
  BUNDLE_BUDGET_GATE_P3_59_DOC,
  "lib/performance/bundle-size-budget-policy.ts",
  "lib/qa/bundle-budget-gate-p3-59-measurement.ts",
  "lib/qa/bundle-budget-gate-p3-59-audit.ts",
  BUNDLE_BUDGET_GATE_P3_59_CHECK_SCRIPT,
  BUNDLE_BUDGET_GATE_P3_59_E2E_SPEC,
  BUNDLE_BUDGET_GATE_P3_59_FLOW_HELPER,
  BUNDLE_BUDGET_GATE_P3_59_READY_HELPER,
  BUNDLE_BUDGET_GATE_P3_59_UNIT_TEST,
  BUNDLE_BUDGET_GATE_P3_59_UPSTREAM_TEST,
  BUNDLE_BUDGET_GATE_P3_59_ARTIFACT,
  BUNDLE_SIZE_BASELINE_ARTIFACT,
  "docs/bundle-analysis.md",
] as const;

export function isBundleBudgetGateP3_59Enabled(): boolean {
  return process.env.E2E_BUNDLE_BUDGET_GATE?.trim() === "true";
}
