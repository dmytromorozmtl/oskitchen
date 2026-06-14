import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditQrScanStorefrontKdsE2EP137,
  formatQrScanStorefrontKdsE2EP137AuditLines,
  readQrScanStorefrontKdsE2EP137Artifact,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-p1-37-audit";
import {
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_ARTIFACT,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHAIN,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHECK_NPM_SCRIPT,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CI_NPM_SCRIPT,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CI_WORKFLOW,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_DOC,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_E2E_NPM_SCRIPT,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_REQUIRED_STEP_IDS,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_WIRING_PATHS,
  QR_SCAN_STOREFRONT_KDS_FLOW_STEPS,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-p1-37-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("QR scan→storefront→KDS E2E (P1-37)", () => {
  it("locks P1-37 policy and QR→checkout→webhook→KitchenTask chain", () => {
    expect(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID).toBe(
      "qr-scan-storefront-kds-e2e-p1-37-v1",
    );
    expect(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHAIN).toEqual([
      "qr",
      "checkout",
      "webhook_event",
      "kitchen_task",
    ]);
    expect(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_REQUIRED_STEP_IDS).toEqual([
      "storefront_checkout",
      "webhook_event_persisted",
      "kitchen_task_linked",
      "kds_ticket_visible",
    ]);
    expect(QR_SCAN_STOREFRONT_KDS_FLOW_STEPS).toEqual([
      "scan_qr_entry",
      "storefront_menu",
      "storefront_checkout",
      "webhook_event_persisted",
      "kitchen_task_linked",
      "verify_kds",
    ]);
  });

  it("passes full P1-37 audit — E2E spec, chain service, artifact wired", () => {
    const summary = auditQrScanStorefrontKdsE2EP137(ROOT);
    expect(summary.baseAuditPassed).toBe(true);
    expect(summary.webhookEventWired).toBe(true);
    expect(summary.kitchenTaskWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("chain service wires outbound webhook and KitchenTask smoke helpers", () => {
    const chain = readSource("services/qa/qr-scan-storefront-kds-e2e-p1-37.ts");
    expect(chain).toContain("runQrScanStorefrontKdsE2EChain");
    expect(chain).toContain("webhook_event_persisted");
    expect(chain).toContain("kitchen_task_linked");

    const smoke = readSource("services/qa/qr-scan-storefront-kds-smoke.ts");
    expect(smoke).toContain("waitForOutboundOrderCreatedWebhook");
    expect(smoke).toContain("ensureKitchenTaskForQrStorefrontKdsSmoke");
    expect(smoke).toContain("order.created");
  });

  it("flow helper invokes chain after storefront checkout", () => {
    const flow = readSource("e2e/helpers/qr-scan-storefront-kds-e2e-flow.ts");
    expect(flow).toContain("runQrScanStorefrontKdsE2EChain");
    expect(flow).toContain("webhook_event_persisted");
    expect(flow).toContain("kitchen_task_linked");
  });

  it("P1-37 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of QR_SCAN_STOREFRONT_KDS_E2E_P1_37_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${QR_SCAN_STOREFRONT_KDS_E2E_P1_37_E2E_NPM_SCRIPT}"`);

    const ci = readSource(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CI_WORKFLOW);
    expect(ci).toContain(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHECK_NPM_SCRIPT);

    const doc = readSource(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_DOC);
    expect(doc).toContain(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID);

    const artifact = readQrScanStorefrontKdsE2EP137Artifact(ROOT);
    expect(artifact?.policyId).toBe(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID);
    expect(artifact?.chain).toEqual([...QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHAIN]);

    expect(existsSync(join(ROOT, QR_SCAN_STOREFRONT_KDS_E2E_P1_37_ARTIFACT))).toBe(true);
  });

  it("formats audit lines", () => {
    const summary = auditQrScanStorefrontKdsE2EP137(ROOT);
    const lines = formatQrScanStorefrontKdsE2EP137AuditLines(summary);
    expect(lines.some((line) => line.includes(QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
