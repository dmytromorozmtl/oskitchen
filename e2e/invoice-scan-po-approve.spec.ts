import { expect, test } from "@playwright/test";

import {
  INVOICE_SCANNER_PATH,
  INVOICE_SCANNER_PO_NOTES_MARKER,
  INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID,
  INVOICE_SCAN_PO_APPROVE_FLOW_STEPS,
  INVOICE_SCAN_REVIEW_PANEL_TEST_ID,
  PURCHASING_ORDERS_PATH,
  parseSupplyCreatedOrderNumber,
} from "@/lib/qa/invoice-scan-po-approve-e2e-policy";
import { mapOcrResultToScannedInvoice } from "@/lib/qa/invoice-scanner-ocr-mapper";

import { runInvoiceScanPoApproveFlow } from "./helpers/invoice-scan-po-approve-flow";
import {
  skipInvoiceScanPoApproveIfGateDisabled,
  skipInvoiceScanPoApproveIfNotAuthed,
} from "./helpers/invoice-scan-po-approve-ready";

/**
 * Invoice scan → PO → approve golden path.
 *
 * Gallery upload → AI review → Confirm All → received PO on purchasing.
 *
 * @see e2e/invoice-scanner.spec.ts
 * @see docs/INVOICE_SCANNER.md
 */

test.describe("invoice scan po approve policy", () => {
  test("exports AI invoice flow routes and steps", () => {
    expect(INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID).toBe("invoice-scan-po-approve-e2e-v1");
    expect(INVOICE_SCANNER_PATH).toBe("/dashboard/inventory/invoice-scanner");
    expect(PURCHASING_ORDERS_PATH).toBe("/dashboard/purchasing/purchase-orders");
    expect(INVOICE_SCAN_REVIEW_PANEL_TEST_ID).toBe("invoice-scan-review-panel");
    expect(INVOICE_SCAN_PO_APPROVE_FLOW_STEPS).toEqual([
      "scan_upload",
      "review_draft",
      "confirm_approve",
      "verify_po",
    ]);
  });

  test("parses supply-created toast PO number", () => {
    expect(
      parseSupplyCreatedOrderNumber("Supply created — PO PO-2026-0042, 3 line(s) received."),
    ).toBe("PO-2026-0042");
  });

  test("maps OCR fixture to scanned invoice draft", () => {
    const scanned = mapOcrResultToScannedInvoice({
      supplierName: "Sysco Foods",
      invoiceNumber: "INV-9001",
      invoiceDate: "2026-06-01",
      dueDate: "2026-06-15",
      totalAmount: 120,
      taxAmount: 10,
      lineItems: [
        {
          description: "Tomatoes",
          quantity: 10,
          unitPrice: 5,
          totalPrice: 50,
          ingredientName: "Tomatoes",
          ingredientId: "ing-1",
        },
      ],
      rawText: "{}",
      confidence: 0.92,
    });
    expect(scanned.supplier).toBe("Sysco Foods");
    expect(scanned.lineItems.length).toBe(1);
    expect(INVOICE_SCANNER_PO_NOTES_MARKER).toContain("AI-assisted");
  });
});

test.describe("invoice scan po approve (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Invoice scan → PO → approve runs in chromium-authed project only",
    );
    skipInvoiceScanPoApproveIfGateDisabled();
    skipInvoiceScanPoApproveIfNotAuthed();
  });

  test("gallery scan confirm creates received purchase order", async ({ page }) => {
    const result = await runInvoiceScanPoApproveFlow(page);
    expect(result.steps).toEqual(INVOICE_SCAN_PO_APPROVE_FLOW_STEPS);
    expect(result.orderNumber.length).toBeGreaterThan(0);
  });
});
