import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditQrScanStorefrontKdsE2E } from "@/lib/qa/qr-scan-storefront-kds-e2e-audit";
import {
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_ARTIFACT,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHAIN,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_REQUIRED_STEP_IDS,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-p1-37-policy";
import { QR_SCAN_STOREFRONT_KDS_FLOW_STEPS } from "@/lib/qa/qr-scan-storefront-kds-e2e-policy";

export type QrScanStorefrontKdsE2EP137AuditSummary = {
  policyId: typeof QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID;
  chain: readonly string[];
  flowSteps: readonly string[];
  baseAuditPassed: boolean;
  webhookEventWired: boolean;
  kitchenTaskWired: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditQrScanStorefrontKdsE2EP137(
  root = process.cwd(),
): QrScanStorefrontKdsE2EP137AuditSummary {
  const base = auditQrScanStorefrontKdsE2E(root);
  const artifactPresent = existsSync(join(root, QR_SCAN_STOREFRONT_KDS_E2E_P1_37_ARTIFACT));

  const flowStepsMatch =
    QR_SCAN_STOREFRONT_KDS_FLOW_STEPS.includes("webhook_event_persisted") &&
    QR_SCAN_STOREFRONT_KDS_FLOW_STEPS.includes("kitchen_task_linked") &&
    QR_SCAN_STOREFRONT_KDS_FLOW_STEPS.includes("verify_kds");

  const passed =
    base.passed &&
    base.webhookEventWired &&
    base.kitchenTaskWired &&
    flowStepsMatch &&
    artifactPresent &&
    QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHAIN.length === 4 &&
    QR_SCAN_STOREFRONT_KDS_E2E_P1_37_REQUIRED_STEP_IDS.length === 4;

  return {
    policyId: QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID,
    chain: QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHAIN,
    flowSteps: QR_SCAN_STOREFRONT_KDS_FLOW_STEPS,
    baseAuditPassed: base.passed,
    webhookEventWired: base.webhookEventWired,
    kitchenTaskWired: base.kitchenTaskWired,
    artifactPresent,
    passed,
  };
}

export function formatQrScanStorefrontKdsE2EP137AuditLines(
  summary: QrScanStorefrontKdsE2EP137AuditSummary,
): string[] {
  return [
    `QR scan→storefront→KDS E2E (P1-37) audit (${summary.policyId})`,
    `Chain: ${summary.chain.join(" → ")}`,
    `Flow steps: ${summary.flowSteps.join(" → ")}`,
    `Base E2E audit: ${summary.baseAuditPassed ? "passed" : "failed"}`,
    `Webhook event wired: ${summary.webhookEventWired ? "yes" : "no"}`,
    `KitchenTask wired: ${summary.kitchenTaskWired ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

export function readQrScanStorefrontKdsE2EP137Artifact(root = process.cwd()): {
  policyId: string;
  chain: string[];
  flowSteps: string[];
} | null {
  const path = join(root, QR_SCAN_STOREFRONT_KDS_E2E_P1_37_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    policyId: string;
    chain: string[];
    flowSteps: string[];
  };
}
