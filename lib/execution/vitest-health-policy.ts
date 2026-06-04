/**
 * FINAL-14 — Vitest unit test health snapshot policy constants.
 */

export const VITEST_HEALTH_POLICY_ID = "final-14-vitest-health-v1" as const;

export const VITEST_HEALTH_SUMMARY_ARTIFACT = "artifacts/vitest-health-summary.json" as const;

export const VITEST_HEALTH_SUMMARY_VERSION = "final-14-vitest-health-v1" as const;

export const VITEST_HEALTH_NPM_SCRIPT = "test" as const;

export const VITEST_HEALTH_RUNNER_SCRIPT = "scripts/ops/run-vitest-health-audit.ts" as const;

/** Final orchestrator capstone unit tests — honest health proxy for npm test / vitest. */
export const VITEST_HEALTH_FINAL_ORCHESTRATOR_TESTS = [
  "tests/unit/final-01-vault-gate-audit-policy.test.ts",
  "tests/unit/final-02-p0-orchestrator-artifact-audit-policy.test.ts",
  "tests/unit/final-03-pilot-gono-go-audit-policy.test.ts",
  "tests/unit/final-04-live-integration-dod-audit-policy.test.ts",
  "tests/unit/final-05-beta-governance-smoke-chain-audit-policy.test.ts",
  "tests/unit/final-06-program-capstone-audit-policy.test.ts",
  "tests/unit/final-07-tracker-reconciliation-audit-policy.test.ts",
  "tests/unit/final-08-forbidden-claims-audit-policy.test.ts",
  "tests/unit/final-09-competitor-intelligence-audit-policy.test.ts",
  "tests/unit/final-10-pm-completion-audit-policy.test.ts",
  "tests/unit/final-11-marketing-completion-audit-policy.test.ts",
  "tests/unit/final-12-design-stabilization-audit-policy.test.ts",
  "tests/unit/final-13-ts-build-green-audit-policy.test.ts",
] as const;
