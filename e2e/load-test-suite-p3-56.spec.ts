import { expect, test } from "@playwright/test";

import { KDS_POLL_FALLBACK_MS } from "@/lib/kitchen/kds-realtime-smoke-policy";
import {
  LOAD_TEST_SUITE_P3_56_FLOW_STEPS,
  LOAD_TEST_SUITE_P3_56_MODULE_COUNT,
  LOAD_TEST_SUITE_P3_56_MODULES,
  LOAD_TEST_SUITE_P3_56_POLICY_ID,
  loadTestSuiteModuleIds,
} from "@/lib/qa/load-test-suite-p3-56-policy";
import {
  buildLoadTestSuiteModuleStatuses,
  validateLoadTestSuiteContract,
} from "@/lib/qa/load-test-suite-p3-56-measurement";

import {
  listLoadTestSuiteModules,
  loadTestSuiteModuleCount,
  runLoadTestSuiteContractStep,
  runLoadTestSuiteFlow,
} from "./helpers/load-test-suite-p3-56-flow";

/**
 * Load test suite — webhook burst, KDS refresh, POS checkout concurrency.
 *
 * @see docs/load-test-suite-p3-56.md
 */

test.describe("load test suite p3-56 policy", () => {
  test("exports three load modules with k6 scripts", () => {
    expect(LOAD_TEST_SUITE_P3_56_POLICY_ID).toBe("load-test-suite-p3-56-v1");
    expect(loadTestSuiteModuleIds()).toHaveLength(LOAD_TEST_SUITE_P3_56_MODULE_COUNT);
    expect(loadTestSuiteModuleCount()).toBe(3);
    expect(LOAD_TEST_SUITE_P3_56_MODULES.map((module) => module.id)).toEqual([
      "webhook_burst",
      "kds_refresh",
      "pos_checkout_concurrency",
    ]);
    expect(validateLoadTestSuiteContract().passed).toBe(true);
  });

  test("kds refresh module aligns with poll fallback interval", () => {
    expect(KDS_POLL_FALLBACK_MS).toBe(15_000);
    const kds = LOAD_TEST_SUITE_P3_56_MODULES.find((module) => module.id === "kds_refresh");
    expect(kds?.targetPath).toBe("/api/health");
  });

  test("webhook burst targets woocommerce ingress", () => {
    const webhook = LOAD_TEST_SUITE_P3_56_MODULES.find((module) => module.id === "webhook_burst");
    expect(webhook?.targetPath).toBe("/api/webhooks/woocommerce");
    expect(webhook?.burstVus).toBeGreaterThanOrEqual(10);
  });

  test("each module k6 script exists on disk", () => {
    for (const status of buildLoadTestSuiteModuleStatuses()) {
      expect(status.k6ScriptPresent, `${status.moduleId} k6`).toBe(true);
    }
  });
});

test.describe("load test suite contract step", () => {
  test("validates three-module load test contract", () => {
    const result = runLoadTestSuiteContractStep();
    expect(result.contractValid).toBe(true);
    expect(result.moduleCount).toBe(3);
    expect(result.modules).toEqual(listLoadTestSuiteModules());
  });
});

test.describe("load test suite orchestrator", () => {
  test("lists all load modules with contract steps", () => {
    const result = runLoadTestSuiteFlow();
    expect(result.contractValid).toBe(true);
    expect(result.moduleCount).toBe(3);
    expect(LOAD_TEST_SUITE_P3_56_FLOW_STEPS).toEqual([
      "validate_load_test_contract",
      "webhook_burst_module",
      "kds_refresh_module",
      "pos_checkout_concurrency_module",
    ]);
  });
});
