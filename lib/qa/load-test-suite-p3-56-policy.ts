/**
 * Blueprint P3-56 — Load test suite.
 *
 * Webhook burst, KDS refresh, POS checkout concurrency.
 *
 * @see e2e/load-test-suite-p3-56.spec.ts
 * @see docs/load-test-suite-p3-56.md
 */

export const LOAD_TEST_SUITE_P3_56_POLICY_ID = "load-test-suite-p3-56-v1" as const;

export const LOAD_TEST_SUITE_P3_56_DOC = "docs/load-test-suite-p3-56.md" as const;

export const LOAD_TEST_SUITE_P3_56_ARTIFACT =
  "artifacts/load-test-suite-p3-56-registry.json" as const;

export const LOAD_TEST_SUITE_P3_56_SPEC = "e2e/load-test-suite-p3-56.spec.ts" as const;

export const LOAD_TEST_SUITE_P3_56_FLOW_HELPER =
  "e2e/helpers/load-test-suite-p3-56-flow.ts" as const;

export const LOAD_TEST_SUITE_P3_56_READY_HELPER =
  "e2e/helpers/load-test-suite-p3-56-ready.ts" as const;

export const LOAD_TEST_SUITE_P3_56_AUDIT_SCRIPT =
  "scripts/audit-load-test-suite-p3-56.ts" as const;

export const LOAD_TEST_SUITE_P3_56_NPM_SCRIPT = "audit:load-test-suite-p3-56" as const;

export const LOAD_TEST_SUITE_P3_56_CHECK_NPM_SCRIPT = "check:load-test-suite-p3-56" as const;

export const LOAD_TEST_SUITE_P3_56_UNIT_TEST = "tests/unit/load-test-suite-p3-56.test.ts" as const;

export const LOAD_TEST_SUITE_P3_56_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const LOAD_TEST_SUITE_P3_56_MODULE_COUNT = 3 as const;

export const LOAD_TEST_SUITE_P3_56_FLOW_STEPS = [
  "validate_load_test_contract",
  "webhook_burst_module",
  "kds_refresh_module",
  "pos_checkout_concurrency_module",
] as const;

export const LOAD_TEST_SUITE_P3_56_MODULES = [
  {
    id: "webhook_burst",
    label: "Webhook burst",
    k6Script: "scripts/load/webhook-burst-p3-56.k6.js",
    npmScript: "test:k6:load-webhook-burst-p3-56",
    targetPath: "/api/webhooks/woocommerce",
    burstVus: 20,
    duration: "30s",
    maxErrorRate: 0.05,
    maxP95Ms: 2000,
    minRequests: 100,
  },
  {
    id: "kds_refresh",
    label: "KDS refresh",
    k6Script: "scripts/load/kds-refresh-p3-56.k6.js",
    npmScript: "test:k6:load-kds-refresh-p3-56",
    targetPath: "/api/health",
    burstVus: 15,
    duration: "30s",
    maxErrorRate: 0.01,
    maxP95Ms: 1500,
    minRequests: 150,
  },
  {
    id: "pos_checkout_concurrency",
    label: "POS checkout concurrency",
    k6Script: "scripts/load/pos-checkout-concurrency-p3-56.k6.js",
    npmScript: "test:k6:load-pos-checkout-p3-56",
    targetPath: "/api/pos/terminal",
    burstVus: 8,
    duration: "45s",
    maxErrorRate: 0.05,
    maxP95Ms: 3000,
    minRequests: 80,
  },
] as const;

export type LoadTestSuiteModuleId = (typeof LOAD_TEST_SUITE_P3_56_MODULES)[number]["id"];

export const LOAD_TEST_SUITE_P3_56_WIRING_PATHS = [
  LOAD_TEST_SUITE_P3_56_DOC,
  "lib/qa/load-test-suite-p3-56-measurement.ts",
  "lib/qa/load-test-suite-p3-56-audit.ts",
  "lib/qa/load-test-suite-p3-56-scoring.ts",
  ...LOAD_TEST_SUITE_P3_56_MODULES.map((module) => module.k6Script),
  LOAD_TEST_SUITE_P3_56_SPEC,
  LOAD_TEST_SUITE_P3_56_FLOW_HELPER,
  LOAD_TEST_SUITE_P3_56_READY_HELPER,
  LOAD_TEST_SUITE_P3_56_UNIT_TEST,
  LOAD_TEST_SUITE_P3_56_ARTIFACT,
] as const;

export function isLoadTestSuiteP3_56Enabled(): boolean {
  return process.env.E2E_LOAD_TEST_SUITE?.trim() === "true";
}

export function loadTestSuiteModuleIds(): LoadTestSuiteModuleId[] {
  return LOAD_TEST_SUITE_P3_56_MODULES.map((module) => module.id);
}
