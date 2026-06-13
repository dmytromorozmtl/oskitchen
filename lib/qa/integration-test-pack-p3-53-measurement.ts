import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_TEST_PACK_P3_53_E2E_SPECS,
  INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT,
  INTEGRATION_TEST_PACK_P3_53_MODULES,
  type IntegrationTestPackModuleId,
} from "@/lib/qa/integration-test-pack-p3-53-policy";
import { POS_CHECKOUT_E2E_FLOW_STEPS } from "@/lib/pos/pos-checkout-e2e-policy";
import { KDS_PLAYWRIGHT_FLOW_STEPS } from "@/lib/qa/kds-playwright-e2e-policy";

export type IntegrationTestPackModuleStatus = {
  moduleId: IntegrationTestPackModuleId;
  specPresent: boolean;
  flowSteps: readonly string[];
};

export function uniqueIntegrationTestPackSpecs(): string[] {
  return [...new Set(INTEGRATION_TEST_PACK_P3_53_MODULES.map((module) => module.spec))];
}

export function buildIntegrationTestPackModuleStatuses(
  root = process.cwd(),
): IntegrationTestPackModuleStatus[] {
  return INTEGRATION_TEST_PACK_P3_53_MODULES.map((module) => ({
    moduleId: module.id,
    specPresent: existsSync(join(root, module.spec)),
    flowSteps: module.flowSteps,
  }));
}

export function posCheckoutStepsIncludeRefundVoidShift(): boolean {
  return (
    POS_CHECKOUT_E2E_FLOW_STEPS.includes("refund") &&
    POS_CHECKOUT_E2E_FLOW_STEPS.includes("void_sale") &&
    POS_CHECKOUT_E2E_FLOW_STEPS.includes("open_shift") &&
    POS_CHECKOUT_E2E_FLOW_STEPS.includes("close_shift")
  );
}

export function kdsModuleStepsValid(): boolean {
  return (
    KDS_PLAYWRIGHT_FLOW_STEPS.includes("kds_ticket") &&
    KDS_PLAYWRIGHT_FLOW_STEPS.includes("bump_ready") &&
    KDS_PLAYWRIGHT_FLOW_STEPS.includes("complete_order")
  );
}

export function validateIntegrationTestPackContract(root = process.cwd()): {
  passed: boolean;
  moduleCount: number;
  specCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const statuses = buildIntegrationTestPackModuleStatuses(root);

  if (statuses.length !== INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT) {
    errors.push(
      `Expected ${INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT} modules, got ${statuses.length}`,
    );
  }

  for (const status of statuses) {
    if (!status.specPresent) {
      errors.push(`${status.moduleId}: missing spec`);
    }
    if (status.flowSteps.length === 0) {
      errors.push(`${status.moduleId}: missing flow steps`);
    }
  }

  const moduleIds = statuses.map((status) => status.moduleId);
  if (new Set(moduleIds).size !== moduleIds.length) {
    errors.push("Duplicate integration pack module ids");
  }

  const requiredModules: IntegrationTestPackModuleId[] = [
    "shopify_webhook",
    "woocommerce_webhook",
    "kds",
    "pos",
    "refund",
    "void",
    "shift",
  ];
  for (const required of requiredModules) {
    if (!moduleIds.includes(required)) {
      errors.push(`Missing required module: ${required}`);
    }
  }

  if (!posCheckoutStepsIncludeRefundVoidShift()) {
    errors.push("POS checkout policy missing refund/void/shift steps");
  }

  if (!kdsModuleStepsValid()) {
    errors.push("KDS playwright policy missing bump/expo/complete steps");
  }

  for (const spec of INTEGRATION_TEST_PACK_P3_53_E2E_SPECS) {
    if (!existsSync(join(root, spec))) {
      errors.push(`Missing pack E2E spec: ${spec}`);
    }
  }

  return {
    passed: errors.length === 0,
    moduleCount: statuses.length,
    specCount: uniqueIntegrationTestPackSpecs().length,
    errors,
  };
}

export function findIntegrationTestPackModule(moduleId: IntegrationTestPackModuleId) {
  return INTEGRATION_TEST_PACK_P3_53_MODULES.find((module) => module.id === moduleId);
}
