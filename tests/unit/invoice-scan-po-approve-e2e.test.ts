import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditInvoiceScanPoApproveE2E } from "@/lib/qa/invoice-scan-po-approve-e2e-audit";
import {
  INVOICE_SCANNER_PO_NOTES_MARKER,
  INVOICE_SCAN_PO_APPROVE_AUDIT_SCRIPT,
  INVOICE_SCAN_PO_APPROVE_CI_WORKFLOW,
  INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID,
  INVOICE_SCAN_PO_APPROVE_E2E_SPEC,
  INVOICE_SCAN_PO_APPROVE_FLOW_STEPS,
  INVOICE_SCAN_PO_APPROVE_NPM_SCRIPT,
  INVOICE_SCAN_PO_APPROVE_UNIT_TEST,
  INVOICE_SCANNER_PATH,
  PURCHASING_ORDERS_PATH,
  hasInvoiceScanPoApproveCredentials,
  isInvoiceScanPoApproveE2EEnabled,
  parseSupplyCreatedOrderNumber,
  purchaseOrderDetailPath,
} from "@/lib/qa/invoice-scan-po-approve-e2e-policy";
import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";

const ROOT = process.cwd();

describe("Invoice scan → PO → approve E2E (P1-45)", () => {
  it("locks policy id and AI invoice flow routes", () => {
    expect(INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID).toBe("invoice-scan-po-approve-e2e-v1");
    expect(INVOICE_SCANNER_PATH).toBe("/dashboard/inventory/invoice-scanner");
    expect(PURCHASING_ORDERS_PATH).toBe("/dashboard/purchasing/purchase-orders");
    expect(purchaseOrderDetailPath("abc")).toBe("/dashboard/purchasing/purchase-orders/abc");
    expect(INVOICE_SCAN_PO_APPROVE_FLOW_STEPS).toHaveLength(4);
  });

  it("parses confirm toast PO number", () => {
    expect(parseSupplyCreatedOrderNumber("Supply created — PO PO-77, 2 line(s) received.")).toBe(
      "PO-77",
    );
  });

  it("OCR mapper produces reviewable scanned invoice draft", () => {
    const scanned = mapOcrResultToScannedInvoice({
      supplierName: "Fresh Valley Produce",
      invoiceNumber: "INV-42",
      invoiceDate: "2026-06-01",
      dueDate: "2026-06-15",
      totalAmount: 55,
      taxAmount: 4,
      lineItems: [
        {
          description: "Basil",
          quantity: 2,
          unitPrice: 25.5,
          totalPrice: 51,
          ingredientName: "Basil",
          ingredientId: "ing-basil",
        },
      ],
      rawText: "{}",
      confidence: 0.88,
    });
    expect(scanned.lineItems[0]?.name).toBe("Basil");
    expect(scanned.confidence).toBeGreaterThan(0.8);
  });

  it("audits E2E spec, flow helper, and scanner UI wiring", () => {
    const summary = auditInvoiceScanPoApproveE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.scannerUiWired).toBe(true);
    expect(summary.scannerPagePresent).toBe(true);
    expect(summary.purchasingPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, INVOICE_SCAN_PO_APPROVE_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INVOICE_SCAN_PO_APPROVE_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, INVOICE_SCAN_PO_APPROVE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INVOICE_SCAN_PO_APPROVE_NPM_SCRIPT]).toContain(
      "audit-invoice-scan-po-approve-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:invoice-scan-po-approve-e2e"]).toContain(
      INVOICE_SCAN_PO_APPROVE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, INVOICE_SCAN_PO_APPROVE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:invoice-scan-po-approve-e2e");
  });

  it("scanner PO notes marker identifies AI-assisted receipts", () => {
    expect(INVOICE_SCANNER_PO_NOTES_MARKER).toBe("AI-assisted invoice scanning");
  });

  it("E2E gate requires E2E_INVOICE_SCANNER_E2E flag", () => {
    const original = process.env.E2E_INVOICE_SCANNER_E2E;
    delete process.env.E2E_INVOICE_SCANNER_E2E;
    expect(isInvoiceScanPoApproveE2EEnabled()).toBe(false);
    process.env.E2E_INVOICE_SCANNER_E2E = "true";
    expect(isInvoiceScanPoApproveE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_INVOICE_SCANNER_E2E = original;
    else delete process.env.E2E_INVOICE_SCANNER_E2E;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasInvoiceScanPoApproveCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
