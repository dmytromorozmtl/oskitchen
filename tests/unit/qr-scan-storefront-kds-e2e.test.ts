import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditQrScanStorefrontKdsE2E,
  formatQrScanStorefrontKdsE2EAuditLines,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-audit";
import {
  QR_SCAN_STOREFRONT_KDS_E2E_AUDIT_SCRIPT,
  QR_SCAN_STOREFRONT_KDS_E2E_CI_WORKFLOW,
  QR_SCAN_STOREFRONT_KDS_FLOW_STEPS,
  QR_SCAN_STOREFRONT_KDS_E2E_NPM_SCRIPT,
  QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID,
  QR_SCAN_STOREFRONT_KDS_E2E_SPEC,
  QR_SCAN_STOREFRONT_KDS_E2E_UNIT_TEST,
  hasQrScanStorefrontKdsE2ECredentials,
  isQrScanStorefrontKdsE2EEnabled,
  isQrScanStorefrontKdsKdsGateEnabled,
  qrScanEntryPath,
  storefrontMenuPath,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-policy";

const ROOT = process.cwd();

describe("QR scan→storefront→KDS E2E (P2-32)", () => {
  it("locks policy id and six-step flow with webhook and KitchenTask", () => {
    expect(QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID).toBe("qr-scan-storefront-kds-e2e-p2-32-v1");
    expect(QR_SCAN_STOREFRONT_KDS_FLOW_STEPS).toHaveLength(6);
    expect(qrScanEntryPath("hello", "5")).toBe("/q/hello/5");
    expect(storefrontMenuPath("hello")).toBe("/s/hello/menu");
  });

  it("audits E2E spec, flow helper, and storefront checkout wiring", () => {
    const summary = auditQrScanStorefrontKdsE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.readyHelperPresent).toBe(true);
    expect(summary.scanEntryWired).toBe(true);
    expect(summary.storefrontCheckoutWired).toBe(true);
    expect(summary.webhookEventWired).toBe(true);
    expect(summary.kitchenTaskWired).toBe(true);
    expect(summary.kdsAssertWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, QR_SCAN_STOREFRONT_KDS_E2E_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, QR_SCAN_STOREFRONT_KDS_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, QR_SCAN_STOREFRONT_KDS_E2E_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[QR_SCAN_STOREFRONT_KDS_E2E_NPM_SCRIPT]).toContain(
      "audit-qr-scan-storefront-kds-e2e.ts",
    );
    expect(pkg.scripts?.["check:qr-scan-storefront-kds-e2e"]).toContain(
      QR_SCAN_STOREFRONT_KDS_E2E_UNIT_TEST,
    );
    expect(pkg.scripts?.["test:e2e:qr-scan-storefront-kds-e2e"]).toContain(
      QR_SCAN_STOREFRONT_KDS_E2E_SPEC,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:qr-scan-storefront-kds-e2e"]).toContain(
      QR_SCAN_STOREFRONT_KDS_E2E_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, QR_SCAN_STOREFRONT_KDS_E2E_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("qr-scan-storefront-kds-e2e");
  });

  it("formats audit lines", () => {
    const summary = auditQrScanStorefrontKdsE2E(ROOT);
    const lines = formatQrScanStorefrontKdsE2EAuditLines(summary);
    expect(lines.some((line) => line.includes(QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });

  it("E2E gate requires E2E_QR_SCAN_STOREFRONT_KDS flag", () => {
    const original = process.env.E2E_QR_SCAN_STOREFRONT_KDS;
    delete process.env.E2E_QR_SCAN_STOREFRONT_KDS;
    expect(isQrScanStorefrontKdsE2EEnabled()).toBe(false);
    process.env.E2E_QR_SCAN_STOREFRONT_KDS = "true";
    expect(isQrScanStorefrontKdsE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_QR_SCAN_STOREFRONT_KDS = original;
    else delete process.env.E2E_QR_SCAN_STOREFRONT_KDS;
  });

  it("credentials and KDS gate helpers", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasQrScanStorefrontKdsE2ECredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;

    const originalKds = process.env.ENABLE_KDS_V1_CERTIFIED;
    delete process.env.ENABLE_KDS_V1_CERTIFIED;
    if (process.env.NODE_ENV !== "production") {
      expect(isQrScanStorefrontKdsKdsGateEnabled()).toBe(false);
    }
    process.env.ENABLE_KDS_V1_CERTIFIED = "true";
    expect(isQrScanStorefrontKdsKdsGateEnabled()).toBe(true);
    if (originalKds !== undefined) process.env.ENABLE_KDS_V1_CERTIFIED = originalKds;
    else delete process.env.ENABLE_KDS_V1_CERTIFIED;
  });
});
