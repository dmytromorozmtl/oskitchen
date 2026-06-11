import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ORDER_HUB_PANEL_TEST_ID,
  ORDER_HUB_PATH,
  WEBHOOK_INGEST_ORDER_CREATION_AUDIT_SCRIPT,
  WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID,
  WEBHOOK_INGEST_ORDER_CREATION_E2E_SPEC,
  WEBHOOK_INGEST_ORDER_CREATION_FLOW_HELPER,
  WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS,
  WEBHOOK_INGEST_ORDER_CREATION_NPM_SCRIPT,
  WEBHOOK_INGEST_ORDER_CREATION_READY_HELPER,
  WEBHOOK_INGEST_ORDER_CREATION_UNIT_TEST,
  WOOCOMMERCE_WEBHOOK_PATH,
} from "@/lib/qa/webhook-ingest-order-creation-e2e-policy";

export type WebhookIngestOrderCreationE2EAuditSummary = {
  policyId: typeof WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  wooWebhookFlowWired: boolean;
  orderHubUiWired: boolean;
  orderHubPagePresent: boolean;
  kitchenPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditWebhookIngestOrderCreationE2E(
  root = process.cwd(),
): WebhookIngestOrderCreationE2EAuditSummary {
  const specPath = join(root, WEBHOOK_INGEST_ORDER_CREATION_E2E_SPEC);
  const flowPath = join(root, WEBHOOK_INGEST_ORDER_CREATION_FLOW_HELPER);
  const readyPath = join(root, WEBHOOK_INGEST_ORDER_CREATION_READY_HELPER);
  const wooFlowPath = join(root, "e2e/helpers/woocommerce-webhook-order-hub-flow.ts");
  const orderHubPagePath = join(root, "app/dashboard/order-hub/page.tsx");
  const kitchenPagePath = join(root, "app/dashboard/kitchen/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const orderHubPagePresent = existsSync(orderHubPagePath);
  const kitchenPagePresent = existsSync(kitchenPagePath);

  let wooWebhookFlowWired = false;
  if (existsSync(wooFlowPath)) {
    const source = readFileSync(wooFlowPath, "utf8");
    wooWebhookFlowWired =
      source.includes("postSignedWooOrderWebhook") &&
      source.includes("assertWooOrderVisibleOnOrderHub") &&
      source.includes("woocommerceWebhookUrl");
  }

  let orderHubUiWired = false;
  if (existsSync(orderHubPagePath)) {
    orderHubUiWired = readFileSync(orderHubPagePath, "utf8").includes(ORDER_HUB_PANEL_TEST_ID);
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID"));
  const flowReferencesIngest =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(WOOCOMMERCE_WEBHOOK_PATH) ||
      readFileSync(flowPath, "utf8").includes("postSignedWooOrderWebhook"));
  const flowReferencesOrderCreation =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("waitForKitchenImport") ||
      readFileSync(flowPath, "utf8").includes("verify_kitchen_import") ||
      readFileSync(flowPath, "utf8").includes("assertStorefrontOrderOnKds"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    orderHubPagePresent &&
    kitchenPagePresent &&
    wooWebhookFlowWired &&
    orderHubUiWired &&
    specReferencesPolicy &&
    flowReferencesIngest &&
    flowReferencesOrderCreation &&
    WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS.length >= 4;

  return {
    policyId: WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    wooWebhookFlowWired,
    orderHubUiWired,
    orderHubPagePresent,
    kitchenPagePresent,
    flowStepCount: WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS.length,
    passed,
  };
}

export function formatWebhookIngestOrderCreationAuditLines(
  summary: WebhookIngestOrderCreationE2EAuditSummary,
): string[] {
  return [
    `Webhook ingest → order creation E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${WEBHOOK_INGEST_ORDER_CREATION_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Woo webhook flow wired: ${summary.wooWebhookFlowWired ? "yes" : "no"}`,
    `Order hub UI testid wired: ${summary.orderHubUiWired ? "yes" : "no"}`,
    `Order hub page: ${summary.orderHubPagePresent ? "present" : "missing"}`,
    `Kitchen page: ${summary.kitchenPagePresent ? "present" : "missing"}`,
    `Order hub path: ${ORDER_HUB_PATH}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${WEBHOOK_INGEST_ORDER_CREATION_UNIT_TEST}`,
    `Audit script: ${WEBHOOK_INGEST_ORDER_CREATION_AUDIT_SCRIPT}`,
    `NPM script: ${WEBHOOK_INGEST_ORDER_CREATION_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
