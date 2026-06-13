import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_TEST_PACK_P3_53_DOC,
  INTEGRATION_TEST_PACK_P3_53_FLOW_HELPER,
  INTEGRATION_TEST_PACK_P3_53_FLOW_STEPS,
  INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT,
  INTEGRATION_TEST_PACK_P3_53_MODULES,
  INTEGRATION_TEST_PACK_P3_53_POLICY_ID,
  INTEGRATION_TEST_PACK_P3_53_READY_HELPER,
  INTEGRATION_TEST_PACK_P3_53_SPEC,
  INTEGRATION_TEST_PACK_P3_53_WIRING_PATHS,
} from "@/lib/qa/integration-test-pack-p3-53-policy";
import {
  uniqueIntegrationTestPackSpecs,
  validateIntegrationTestPackContract,
} from "@/lib/qa/integration-test-pack-p3-53-measurement";

export type IntegrationTestPackP3_53AuditSummary = {
  policyId: typeof INTEGRATION_TEST_PACK_P3_53_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  sevenModulesPresent: boolean;
  shopifyWebhookWired: boolean;
  passed: boolean;
};

export function auditIntegrationTestPackP3_53(
  root = process.cwd(),
): IntegrationTestPackP3_53AuditSummary {
  const wiringComplete = INTEGRATION_TEST_PACK_P3_53_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, INTEGRATION_TEST_PACK_P3_53_DOC))) {
    const source = readFileSync(join(root, INTEGRATION_TEST_PACK_P3_53_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("shopify") &&
      source.includes("woocommerce") &&
      source.includes("kds") &&
      source.includes("refund") &&
      source.includes("void") &&
      source.includes("shift");
  }

  let specWired = false;
  if (existsSync(join(root, INTEGRATION_TEST_PACK_P3_53_SPEC))) {
    const source = readFileSync(join(root, INTEGRATION_TEST_PACK_P3_53_SPEC), "utf8");
    specWired =
      source.includes("integration-test-pack-p3-53-v1") &&
      source.includes("runIntegrationTestPackContractStep") &&
      source.includes("shopify_webhook");
  }

  let flowWired = false;
  if (existsSync(join(root, INTEGRATION_TEST_PACK_P3_53_FLOW_HELPER))) {
    const source = readFileSync(join(root, INTEGRATION_TEST_PACK_P3_53_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runIntegrationTestPackContractStep") &&
      source.includes("listIntegrationTestPackModules") &&
      existsSync(join(root, INTEGRATION_TEST_PACK_P3_53_READY_HELPER));
  }

  const contract = validateIntegrationTestPackContract(root);
  const sevenModulesPresent =
    INTEGRATION_TEST_PACK_P3_53_MODULES.length === INTEGRATION_TEST_PACK_P3_53_MODULE_COUNT;

  const shopifyWebhookWired = INTEGRATION_TEST_PACK_P3_53_MODULES.some(
    (module) => module.id === "shopify_webhook" && module.policyId === "shopify-webhook-order-hub-e2e-v1",
  );

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    sevenModulesPresent &&
    shopifyWebhookWired &&
    uniqueIntegrationTestPackSpecs().length >= 4 &&
    INTEGRATION_TEST_PACK_P3_53_FLOW_STEPS.length === 8;

  return {
    policyId: INTEGRATION_TEST_PACK_P3_53_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    sevenModulesPresent,
    shopifyWebhookWired,
    passed,
  };
}

export function formatIntegrationTestPackP3_53AuditLines(
  summary: IntegrationTestPackP3_53AuditSummary,
): string[] {
  return [
    `Integration test pack audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${INTEGRATION_TEST_PACK_P3_53_DOC})`,
    `Spec wired: ${summary.specWired ? "yes" : "no"} (${INTEGRATION_TEST_PACK_P3_53_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Seven modules: ${summary.sevenModulesPresent ? "yes" : "no"}`,
    `Shopify webhook module: ${summary.shopifyWebhookWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
