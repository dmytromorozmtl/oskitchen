import { expect } from "@playwright/test";

import {
  LOAD_TEST_SUITE_P3_56_MODULES,
  LOAD_TEST_SUITE_P3_56_MODULE_COUNT,
  type LoadTestSuiteModuleId,
} from "@/lib/qa/load-test-suite-p3-56-policy";
import {
  buildLoadTestSuiteModuleStatuses,
  validateLoadTestSuiteContract,
} from "@/lib/qa/load-test-suite-p3-56-measurement";

export function runLoadTestSuiteContractStep(): {
  contractValid: boolean;
  moduleCount: number;
  modules: LoadTestSuiteModuleId[];
} {
  const result = validateLoadTestSuiteContract();
  expect(result.errors, "Load test suite contract should be valid").toEqual([]);
  return {
    contractValid: result.passed,
    moduleCount: result.moduleCount,
    modules: LOAD_TEST_SUITE_P3_56_MODULES.map((module) => module.id),
  };
}

export function listLoadTestSuiteModules(): LoadTestSuiteModuleId[] {
  return LOAD_TEST_SUITE_P3_56_MODULES.map((module) => module.id);
}

export function runLoadTestSuiteFlow(): {
  contractValid: boolean;
  moduleCount: number;
  modules: LoadTestSuiteModuleId[];
} {
  const contract = runLoadTestSuiteContractStep();
  for (const status of buildLoadTestSuiteModuleStatuses()) {
    expect(status.k6ScriptPresent, `${status.moduleId} k6 script`).toBe(true);
  }
  return contract;
}

export function loadTestSuiteModuleCount(): number {
  return LOAD_TEST_SUITE_P3_56_MODULE_COUNT;
}
