import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETPLACE_MATURITY_E2E_AUDIT_SCRIPT,
  MARKETPLACE_MATURITY_E2E_FLOW_HELPER,
  MARKETPLACE_MATURITY_E2E_FLOW_STEPS,
  MARKETPLACE_MATURITY_E2E_POLICY_ID,
  MARKETPLACE_MATURITY_E2E_READY_HELPER,
  MARKETPLACE_MATURITY_E2E_SPEC,
  MARKETPLACE_MATURITY_E2E_UNIT_TEST,
  MARKETPLACE_MATURITY_LIFECYCLE_UNIT_TEST,
  MARKETPLACE_VENDOR_FINANCE_PATH,
} from "@/lib/marketplace/marketplace-maturity-e2e-policy";

export type MarketplaceMaturityE2EAuditSummary = {
  policyId: typeof MARKETPLACE_MATURITY_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  cartPoFulfillWired: boolean;
  vendorFinancePagePresent: boolean;
  lifecycleUnitTestPresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditMarketplaceMaturityE2E(
  root = process.cwd(),
): MarketplaceMaturityE2EAuditSummary {
  const specPath = join(root, MARKETPLACE_MATURITY_E2E_SPEC);
  const flowPath = join(root, MARKETPLACE_MATURITY_E2E_FLOW_HELPER);
  const readyPath = join(root, MARKETPLACE_MATURITY_E2E_READY_HELPER);
  const cartPoFulfillFlowPath = join(
    root,
    "e2e/helpers/marketplace-cart-po-fulfill-flow.ts",
  );
  const vendorFinancePagePath = join(root, "app/vendor/(cabinet)/finance/page.tsx");
  const lifecycleTestPath = join(root, MARKETPLACE_MATURITY_LIFECYCLE_UNIT_TEST);

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const vendorFinancePagePresent = existsSync(vendorFinancePagePath);
  const lifecycleUnitTestPresent = existsSync(lifecycleTestPath);

  let cartPoFulfillWired = false;
  if (flowHelperPresent && existsSync(cartPoFulfillFlowPath)) {
    const flowSource = readFileSync(flowPath, "utf8");
    cartPoFulfillWired =
      flowSource.includes("runMarketplaceCartPoFulfillFlow") ||
      flowSource.includes("fulfillVendorPurchaseOrder");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(MARKETPLACE_MATURITY_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("MARKETPLACE_MATURITY_E2E_POLICY_ID"));
  const flowReferencesPayout =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("requestVendorPayout") ||
      readFileSync(flowPath, "utf8").includes("Request payout"));
  const flowReferencesFinance =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(MARKETPLACE_VENDOR_FINANCE_PATH) ||
      readFileSync(flowPath, "utf8").includes("MARKETPLACE_VENDOR_FINANCE_PATH"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    vendorFinancePagePresent &&
    lifecycleUnitTestPresent &&
    cartPoFulfillWired &&
    specReferencesPolicy &&
    flowReferencesPayout &&
    flowReferencesFinance &&
    MARKETPLACE_MATURITY_E2E_FLOW_STEPS.length === 5;

  return {
    policyId: MARKETPLACE_MATURITY_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    cartPoFulfillWired,
    vendorFinancePagePresent,
    lifecycleUnitTestPresent,
    flowStepCount: MARKETPLACE_MATURITY_E2E_FLOW_STEPS.length,
    passed,
  };
}

export function formatMarketplaceMaturityE2EAuditLines(
  summary: MarketplaceMaturityE2EAuditSummary,
): string[] {
  return [
    `Marketplace maturity E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${MARKETPLACE_MATURITY_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Cart → PO → fulfill wired: ${summary.cartPoFulfillWired ? "yes" : "no"}`,
    `Vendor finance page: ${summary.vendorFinancePagePresent ? "present" : "missing"}`,
    `Lifecycle unit test: ${summary.lifecycleUnitTestPresent ? "present" : "missing"} (${MARKETPLACE_MATURITY_LIFECYCLE_UNIT_TEST})`,
    `Finance path: ${MARKETPLACE_VENDOR_FINANCE_PATH}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${MARKETPLACE_MATURITY_E2E_UNIT_TEST}`,
    `Audit script: ${MARKETPLACE_MATURITY_E2E_AUDIT_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
