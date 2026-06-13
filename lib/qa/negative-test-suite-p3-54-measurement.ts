import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  NEGATIVE_TEST_SUITE_P3_54_E2E_SPECS,
  NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT,
  NEGATIVE_TEST_SUITE_P3_54_MODULES,
  type NegativeTestSuiteModuleId,
} from "@/lib/qa/negative-test-suite-p3-54-policy";
import { EXPIRED_SESSION_FLOW_STEPS } from "@/lib/qa/expired-session-e2e-policy";
import { WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS } from "@/lib/qa/webhook-signature-regression-policy";

export type NegativeTestSuiteModuleStatus = {
  moduleId: NegativeTestSuiteModuleId;
  specPresent: boolean;
  expectedStatus: number;
  flowSteps: readonly string[];
};

export function uniqueNegativeTestSuiteSpecs(): string[] {
  return [...new Set(NEGATIVE_TEST_SUITE_P3_54_MODULES.map((module) => module.spec))];
}

export function buildNegativeTestSuiteModuleStatuses(
  root = process.cwd(),
): NegativeTestSuiteModuleStatus[] {
  return NEGATIVE_TEST_SUITE_P3_54_MODULES.map((module) => ({
    moduleId: module.id,
    specPresent: existsSync(join(root, module.spec)),
    expectedStatus: module.expectedStatus,
    flowSteps: module.flowSteps,
  }));
}

export function validateNegativeTestSuiteContract(root = process.cwd()): {
  passed: boolean;
  moduleCount: number;
  specCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const statuses = buildNegativeTestSuiteModuleStatuses(root);

  if (statuses.length !== NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT) {
    errors.push(
      `Expected ${NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT} modules, got ${statuses.length}`,
    );
  }

  const requiredModules: NegativeTestSuiteModuleId[] = [
    "invalid_signature",
    "replay_webhook",
    "wrong_tenant",
    "expired_session",
    "no_permission",
  ];

  for (const required of requiredModules) {
    const status = statuses.find((entry) => entry.moduleId === required);
    if (!status) {
      errors.push(`Missing module: ${required}`);
      continue;
    }
    if (!status.specPresent) {
      errors.push(`${required}: missing spec`);
    }
    if (status.flowSteps.length === 0) {
      errors.push(`${required}: missing flow steps`);
    }
  }

  const invalidSignature = statuses.find((entry) => entry.moduleId === "invalid_signature");
  if (invalidSignature?.expectedStatus !== WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS) {
    errors.push("invalid_signature module must expect HTTP 401");
  }

  if (EXPIRED_SESSION_FLOW_STEPS.length !== 2) {
    errors.push("expired_session policy must define two flow steps");
  }

  for (const spec of NEGATIVE_TEST_SUITE_P3_54_E2E_SPECS) {
    if (!existsSync(join(root, spec))) {
      errors.push(`Missing negative suite spec: ${spec}`);
    }
  }

  return {
    passed: errors.length === 0,
    moduleCount: statuses.length,
    specCount: uniqueNegativeTestSuiteSpecs().length,
    errors,
  };
}

export function findNegativeTestSuiteModule(moduleId: NegativeTestSuiteModuleId) {
  return NEGATIVE_TEST_SUITE_P3_54_MODULES.find((module) => module.id === moduleId);
}
