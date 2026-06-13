import { expect, test } from "@playwright/test";

import { EXPIRED_SESSION_FLOW_STEPS } from "@/lib/qa/expired-session-e2e-policy";
import {
  NEGATIVE_TEST_SUITE_P3_54_E2E_SPECS,
  NEGATIVE_TEST_SUITE_P3_54_FLOW_STEPS,
  NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT,
  NEGATIVE_TEST_SUITE_P3_54_MODULES,
  NEGATIVE_TEST_SUITE_P3_54_POLICY_ID,
  negativeTestSuiteModuleIds,
} from "@/lib/qa/negative-test-suite-p3-54-policy";
import {
  buildNegativeTestSuiteModuleStatuses,
  uniqueNegativeTestSuiteSpecs,
  validateNegativeTestSuiteContract,
} from "@/lib/qa/negative-test-suite-p3-54-measurement";
import { WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS } from "@/lib/qa/webhook-signature-regression-policy";

import {
  listNegativeTestSuiteModules,
  negativeTestSuiteModuleCount,
  runNegativeTestSuiteContractStep,
  runNegativeTestSuiteFlow,
} from "./helpers/negative-test-suite-p3-54-flow";

/**
 * Negative test suite — invalid signature, replay webhook, wrong tenant, expired session, no permission.
 *
 * @see docs/negative-test-suite-p3-54.md
 */

test.describe("negative test suite p3-54 policy", () => {
  test("exports five negative modules and orchestrator specs", () => {
    expect(NEGATIVE_TEST_SUITE_P3_54_POLICY_ID).toBe("negative-test-suite-p3-54-v1");
    expect(negativeTestSuiteModuleIds()).toHaveLength(NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT);
    expect(negativeTestSuiteModuleCount()).toBe(5);
    expect(NEGATIVE_TEST_SUITE_P3_54_MODULES.map((module) => module.id)).toEqual([
      "invalid_signature",
      "replay_webhook",
      "wrong_tenant",
      "expired_session",
      "no_permission",
    ]);
    expect(NEGATIVE_TEST_SUITE_P3_54_E2E_SPECS.length).toBeGreaterThanOrEqual(6);
    expect(uniqueNegativeTestSuiteSpecs().length).toBeGreaterThanOrEqual(5);
    expect(validateNegativeTestSuiteContract().passed).toBe(true);
  });

  test("invalid signature module expects HTTP 401", () => {
    const module = NEGATIVE_TEST_SUITE_P3_54_MODULES.find(
      (entry) => entry.id === "invalid_signature",
    );
    expect(module?.expectedStatus).toBe(WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS);
  });

  test("expired session module defines login redirect steps", () => {
    expect(EXPIRED_SESSION_FLOW_STEPS).toEqual([
      "dashboard_redirects_to_login",
      "api_returns_unauthorized",
    ]);
  });

  test("each negative module spec exists on disk", () => {
    for (const status of buildNegativeTestSuiteModuleStatuses()) {
      expect(status.specPresent, `${status.moduleId} spec`).toBe(true);
      expect(status.flowSteps.length).toBeGreaterThan(0);
    }
  });
});

test.describe("negative test suite contract step", () => {
  test("validates five-module negative suite contract", () => {
    const result = runNegativeTestSuiteContractStep();
    expect(result.contractValid).toBe(true);
    expect(result.moduleCount).toBe(5);
    expect(result.modules).toEqual(listNegativeTestSuiteModules());
    expect(result.specCount).toBeGreaterThanOrEqual(5);
  });
});

test.describe("negative test suite orchestrator", () => {
  test("lists all negative modules with contract steps", () => {
    const result = runNegativeTestSuiteFlow();
    expect(result.contractValid).toBe(true);
    expect(result.moduleCount).toBe(5);
    expect(result.steps[0]).toBe(NEGATIVE_TEST_SUITE_P3_54_FLOW_STEPS[0]);
    expect(result.steps).toContain("invalid_signature_module");
    expect(result.steps).toContain("replay_webhook_module");
    expect(result.steps).toContain("wrong_tenant_module");
    expect(result.steps).toContain("expired_session_module");
    expect(result.steps).toContain("no_permission_module");
  });
});
