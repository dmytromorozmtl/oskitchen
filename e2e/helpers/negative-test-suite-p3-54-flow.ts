import { expect } from "@playwright/test";

import {
  NEGATIVE_TEST_SUITE_P3_54_MODULES,
  NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT,
  type NegativeTestSuiteModuleId,
} from "@/lib/qa/negative-test-suite-p3-54-policy";
import {
  buildNegativeTestSuiteModuleStatuses,
  uniqueNegativeTestSuiteSpecs,
  validateNegativeTestSuiteContract,
} from "@/lib/qa/negative-test-suite-p3-54-measurement";

export type NegativeTestSuiteFlowResult = {
  steps: string[];
  contractValid: boolean;
  moduleCount: number;
  specCount: number;
  modules: NegativeTestSuiteModuleId[];
};

export function runNegativeTestSuiteContractStep(): {
  contractValid: boolean;
  moduleCount: number;
  specCount: number;
  modules: NegativeTestSuiteModuleId[];
} {
  const result = validateNegativeTestSuiteContract();
  expect(result.errors, "Negative test suite contract should be valid").toEqual([]);

  return {
    contractValid: result.passed,
    moduleCount: result.moduleCount,
    specCount: result.specCount,
    modules: NEGATIVE_TEST_SUITE_P3_54_MODULES.map((module) => module.id),
  };
}

export function listNegativeTestSuiteModules(): NegativeTestSuiteModuleId[] {
  return NEGATIVE_TEST_SUITE_P3_54_MODULES.map((module) => module.id);
}

export function runNegativeTestSuiteFlow(): NegativeTestSuiteFlowResult {
  const contract = runNegativeTestSuiteContractStep();
  const statuses = buildNegativeTestSuiteModuleStatuses();

  for (const status of statuses) {
    expect(status.specPresent, `${status.moduleId} spec should exist`).toBe(true);
    expect(status.expectedStatus).toBeGreaterThanOrEqual(401);
  }

  return {
    steps: [
      "validate_negative_suite_contract",
      ...contract.modules.map((moduleId) => `${moduleId}_module`),
    ],
    contractValid: contract.contractValid,
    moduleCount: contract.moduleCount,
    specCount: uniqueNegativeTestSuiteSpecs().length,
    modules: contract.modules,
  };
}

export function negativeTestSuiteModuleCount(): number {
  return NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT;
}
