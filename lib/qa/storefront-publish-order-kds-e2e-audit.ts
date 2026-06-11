import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  STOREFRONT_ADMIN_PATH,
  STOREFRONT_ENABLED_CHECKBOX_TEST_ID,
  STOREFRONT_PUBLISH_ORDER_KDS_AUDIT_SCRIPT,
  STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID,
  STOREFRONT_PUBLISH_ORDER_KDS_E2E_SPEC,
  STOREFRONT_PUBLISH_ORDER_KDS_FLOW_HELPER,
  STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS,
  STOREFRONT_PUBLISH_ORDER_KDS_NPM_SCRIPT,
  STOREFRONT_PUBLISH_ORDER_KDS_READY_HELPER,
  STOREFRONT_PUBLISH_ORDER_KDS_UNIT_TEST,
  STOREFRONT_PUBLISHED_CHECKBOX_TEST_ID,
  STOREFRONT_PUBLISH_PANEL_TEST_ID,
  STOREFRONT_SAVE_BTN_TEST_ID,
} from "@/lib/qa/storefront-publish-order-kds-e2e-policy";

export type StorefrontPublishOrderKdsE2EAuditSummary = {
  policyId: typeof STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  storefrontAdminUiWired: boolean;
  checkoutKdsHelpersWired: boolean;
  storefrontAdminPagePresent: boolean;
  kitchenPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditStorefrontPublishOrderKdsE2E(
  root = process.cwd(),
): StorefrontPublishOrderKdsE2EAuditSummary {
  const specPath = join(root, STOREFRONT_PUBLISH_ORDER_KDS_E2E_SPEC);
  const flowPath = join(root, STOREFRONT_PUBLISH_ORDER_KDS_FLOW_HELPER);
  const readyPath = join(root, STOREFRONT_PUBLISH_ORDER_KDS_READY_HELPER);
  const checkoutKdsFlowPath = join(root, "e2e/helpers/storefront-checkout-kds-flow.ts");
  const storefrontPagePath = join(root, "app/dashboard/storefront/page.tsx");
  const kitchenPagePath = join(root, "app/dashboard/kitchen/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const storefrontAdminPagePresent = existsSync(storefrontPagePath);
  const kitchenPagePresent = existsSync(kitchenPagePath);

  let storefrontAdminUiWired = false;
  if (existsSync(storefrontPagePath)) {
    const source = readFileSync(storefrontPagePath, "utf8");
    storefrontAdminUiWired =
      source.includes(STOREFRONT_PUBLISH_PANEL_TEST_ID) &&
      source.includes(STOREFRONT_PUBLISHED_CHECKBOX_TEST_ID) &&
      source.includes(STOREFRONT_ENABLED_CHECKBOX_TEST_ID) &&
      source.includes(STOREFRONT_SAVE_BTN_TEST_ID);
  }

  let checkoutKdsHelpersWired = false;
  if (existsSync(checkoutKdsFlowPath)) {
    const source = readFileSync(checkoutKdsFlowPath, "utf8");
    checkoutKdsHelpersWired =
      source.includes("completeStorefrontPayLaterCheckout") &&
      source.includes("assertStorefrontOrderOnKds");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID"));
  const flowReferencesPublish =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(STOREFRONT_ADMIN_PATH) ||
      readFileSync(flowPath, "utf8").includes("STOREFRONT_ADMIN_PATH") ||
      readFileSync(flowPath, "utf8").includes("ensureStorefrontPublished"));
  const flowReferencesKds =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("assertStorefrontOrderOnKds") ||
      readFileSync(flowPath, "utf8").includes("completeStorefrontPayLaterCheckout"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    storefrontAdminPagePresent &&
    kitchenPagePresent &&
    storefrontAdminUiWired &&
    checkoutKdsHelpersWired &&
    specReferencesPolicy &&
    flowReferencesPublish &&
    flowReferencesKds &&
    STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS.length >= 4;

  return {
    policyId: STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    storefrontAdminUiWired,
    checkoutKdsHelpersWired,
    storefrontAdminPagePresent,
    kitchenPagePresent,
    flowStepCount: STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS.length,
    passed,
  };
}

export function formatStorefrontPublishOrderKdsAuditLines(
  summary: StorefrontPublishOrderKdsE2EAuditSummary,
): string[] {
  return [
    `Storefront publish → order → KDS E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${STOREFRONT_PUBLISH_ORDER_KDS_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Storefront admin UI testids wired: ${summary.storefrontAdminUiWired ? "yes" : "no"}`,
    `Checkout→KDS helpers wired: ${summary.checkoutKdsHelpersWired ? "yes" : "no"}`,
    `Storefront admin page: ${summary.storefrontAdminPagePresent ? "present" : "missing"}`,
    `Kitchen page: ${summary.kitchenPagePresent ? "present" : "missing"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${STOREFRONT_PUBLISH_ORDER_KDS_UNIT_TEST}`,
    `Audit script: ${STOREFRONT_PUBLISH_ORDER_KDS_AUDIT_SCRIPT}`,
    `NPM script: ${STOREFRONT_PUBLISH_ORDER_KDS_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
