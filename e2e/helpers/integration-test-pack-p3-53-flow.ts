import { expect } from "@playwright/test";

import {
  INTEGRATION_TEST_PACK_P3_53_MODULES,
  INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT,
  type IntegrationTestPackModuleId,
} from "@/lib/qa/integration-test-pack-p3-53-policy";
import {
  buildIntegrationTestPackModuleStatuses,
  uniqueIntegrationTestPackSpecs,
  validateIntegrationTestPackContract,
} from "@/lib/qa/integration-test-pack-p3-53-measurement";

export type IntegrationTestPackFlowResult = {
  steps: string[];
  contractValid: boolean;
  moduleCount: number;
  specCount: number;
  modules: IntegrationTestPackModuleId[];
};

export function runIntegrationTestPackContractStep(): {
  contractValid: boolean;
  moduleCount: number;
  specCount: number;
  modules: IntegrationTestPackModuleId[];
} {
  const result = validateIntegrationTestPackContract();
  expect(result.errors, "Integration test pack contract should be valid").toEqual([]);

  return {
    contractValid: result.passed,
    moduleCount: result.moduleCount,
    specCount: result.specCount,
    modules: INTEGRATION_TEST_PACK_P3_53_MODULES.map((module) => module.id),
  };
}

export function listIntegrationTestPackModules(): IntegrationTestPackModuleId[] {
  return INTEGRATION_TEST_PACK_P3_53_MODULES.map((module) => module.id);
}

export function runIntegrationTestPackFlow(): IntegrationTestPackFlowResult {
  const contract = runIntegrationTestPackContractStep();
  const statuses = buildIntegrationTestPackModuleStatuses();

  for (const status of statuses) {
    expect(status.specPresent, `${status.moduleId} spec should exist`).toBe(true);
  }

  return {
    steps: [
      "validate_integration_pack_contract",
      ...contract.modules.map((moduleId) => `${moduleId}_module`),
    ],
    contractValid: contract.contractValid,
    moduleCount: contract.moduleCount,
    specCount: uniqueIntegrationTestPackSpecs().length,
    modules: contract.modules,
  };
}

export function integrationTestPackModuleCount(): number {
  return INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT;
}
