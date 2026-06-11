import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETPLACE_CART_PO_FULFILL_AUDIT_SCRIPT,
  MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID,
  MARKETPLACE_CART_PO_FULFILL_E2E_SPEC,
  MARKETPLACE_CART_PO_FULFILL_FLOW_HELPER,
  MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS,
  MARKETPLACE_CART_PO_FULFILL_NPM_SCRIPT,
  MARKETPLACE_CART_PO_FULFILL_READY_HELPER,
  MARKETPLACE_CART_PO_FULFILL_UNIT_TEST,
  MARKETPLACE_CART_PATH,
  MARKETPLACE_PO_CHECKOUT_PATH,
} from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-policy";

export type MarketplaceCartPoFulfillE2EAuditSummary = {
  policyId: typeof MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  catalogCheckoutWired: boolean;
  marketplacePagesPresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditMarketplaceCartPoFulfillE2E(
  root = process.cwd(),
): MarketplaceCartPoFulfillE2EAuditSummary {
  const specPath = join(root, MARKETPLACE_CART_PO_FULFILL_E2E_SPEC);
  const flowPath = join(root, MARKETPLACE_CART_PO_FULFILL_FLOW_HELPER);
  const readyPath = join(root, MARKETPLACE_CART_PO_FULFILL_READY_HELPER);
  const catalogFlowPath = join(
    root,
    "e2e/helpers/marketplace-catalog-checkout-vendor-order-flow.ts",
  );
  const catalogPagePath = join(root, "app/dashboard/marketplace/catalog/page.tsx");
  const checkoutPagePath = join(root, "app/dashboard/marketplace/checkout/page.tsx");
  const vendorOrdersPagePath = join(root, "app/vendor/(cabinet)/orders/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const marketplacePagesPresent =
    existsSync(catalogPagePath) &&
    existsSync(checkoutPagePath) &&
    existsSync(vendorOrdersPagePath);

  let catalogCheckoutWired = false;
  if (existsSync(catalogFlowPath)) {
    const catalogSource = readFileSync(catalogFlowPath, "utf8");
    catalogCheckoutWired =
      catalogSource.includes("completeMarketplaceCatalogCheckout") &&
      catalogSource.includes("assertBuyerPurchaseOrderListed");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID"));
  const flowReferencesMarketplace =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(MARKETPLACE_CART_PATH) ||
      readFileSync(flowPath, "utf8").includes("MARKETPLACE_CART_PATH") ||
      readFileSync(flowPath, "utf8").includes("completeMarketplaceCatalogCheckout"));
  const flowReferencesFulfill =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("fulfillVendorPurchaseOrder") ||
      readFileSync(flowPath, "utf8").includes("Mark shipped"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    marketplacePagesPresent &&
    catalogCheckoutWired &&
    specReferencesPolicy &&
    flowReferencesMarketplace &&
    flowReferencesFulfill &&
    MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS.length >= 4;

  return {
    policyId: MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    catalogCheckoutWired,
    marketplacePagesPresent,
    flowStepCount: MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS.length,
    passed,
  };
}

export function formatMarketplaceCartPoFulfillAuditLines(
  summary: MarketplaceCartPoFulfillE2EAuditSummary,
): string[] {
  return [
    `Marketplace cart → PO → fulfill E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${MARKETPLACE_CART_PO_FULFILL_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Catalog checkout helpers wired: ${summary.catalogCheckoutWired ? "yes" : "no"}`,
    `Marketplace pages: ${summary.marketplacePagesPresent ? "present" : "missing"}`,
    `Checkout path: ${MARKETPLACE_PO_CHECKOUT_PATH}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${MARKETPLACE_CART_PO_FULFILL_UNIT_TEST}`,
    `NPM script: ${MARKETPLACE_CART_PO_FULFILL_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
