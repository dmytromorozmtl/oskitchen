import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  QR_SCAN_STOREFRONT_KDS_E2E_FLOW_HELPER,
  QR_SCAN_STOREFRONT_KDS_FLOW_STEPS,
  QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID,
  QR_SCAN_STOREFRONT_KDS_E2E_READY_HELPER,
  QR_SCAN_STOREFRONT_KDS_E2E_SPEC,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-policy";

export type QrScanStorefrontKdsE2EAuditSummary = {
  policyId: typeof QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  scanEntryWired: boolean;
  storefrontCheckoutWired: boolean;
  webhookEventWired: boolean;
  kitchenTaskWired: boolean;
  kdsAssertWired: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditQrScanStorefrontKdsE2E(
  root = process.cwd(),
): QrScanStorefrontKdsE2EAuditSummary {
  const specPath = join(root, QR_SCAN_STOREFRONT_KDS_E2E_SPEC);
  const flowPath = join(root, QR_SCAN_STOREFRONT_KDS_E2E_FLOW_HELPER);
  const readyPath = join(root, QR_SCAN_STOREFRONT_KDS_E2E_READY_HELPER);

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let scanEntryWired = false;
  let storefrontCheckoutWired = false;
  let webhookEventWired = false;
  let kitchenTaskWired = false;
  let kdsAssertWired = false;

  if (flowHelperPresent) {
    const source = readFileSync(flowPath, "utf8");
    scanEntryWired =
      source.includes("QR_ORDERING_PAGE_TEST_ID") &&
      source.includes("qrScanEntryPath");
    storefrontCheckoutWired =
      source.includes("completeStorefrontPayLaterCheckout") &&
      source.includes("storefrontMenuPath");
    webhookEventWired =
      source.includes("webhook_event_persisted") &&
      source.includes("runQrScanStorefrontKdsE2EChain");
    kitchenTaskWired =
      source.includes("kitchen_task_linked") &&
      source.includes("runQrScanStorefrontKdsE2EChain");
    kdsAssertWired = source.includes("assertStorefrontOrderOnKds");
  }

  const specReferencesPolicy =
    specPresent &&
    readFileSync(specPath, "utf8").includes(QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID);

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    scanEntryWired &&
    storefrontCheckoutWired &&
    webhookEventWired &&
    kitchenTaskWired &&
    kdsAssertWired &&
    specReferencesPolicy &&
    QR_SCAN_STOREFRONT_KDS_FLOW_STEPS.length === 6;

  return {
    policyId: QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    scanEntryWired,
    storefrontCheckoutWired,
    webhookEventWired,
    kitchenTaskWired,
    kdsAssertWired,
    flowStepCount: QR_SCAN_STOREFRONT_KDS_FLOW_STEPS.length,
    passed,
  };
}

export function formatQrScanStorefrontKdsE2EAuditLines(
  summary: QrScanStorefrontKdsE2EAuditSummary,
): string[] {
  return [
    `QR scan→storefront→KDS E2E audit (${summary.policyId})`,
    `Spec (${QR_SCAN_STOREFRONT_KDS_E2E_SPEC}): ${summary.specPresent ? "yes" : "no"}`,
    `Flow helper: ${summary.flowHelperPresent ? "yes" : "no"}`,
    `Ready helper: ${summary.readyHelperPresent ? "yes" : "no"}`,
    `Scan entry wired: ${summary.scanEntryWired ? "yes" : "no"}`,
    `Storefront checkout wired: ${summary.storefrontCheckoutWired ? "yes" : "no"}`,
    `Webhook event wired: ${summary.webhookEventWired ? "yes" : "no"}`,
    `KitchenTask wired: ${summary.kitchenTaskWired ? "yes" : "no"}`,
    `KDS assert wired: ${summary.kdsAssertWired ? "yes" : "no"}`,
    `Flow steps (${summary.flowStepCount}): ${summary.flowStepCount === 6 ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
