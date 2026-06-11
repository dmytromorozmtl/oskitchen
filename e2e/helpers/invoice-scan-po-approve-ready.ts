import { test } from "@playwright/test";

import {
  hasInvoiceScanPoApproveCredentials,
  isInvoiceScanPoApproveE2EEnabled,
} from "@/lib/qa/invoice-scan-po-approve-e2e-policy";

export function skipInvoiceScanPoApproveIfNotAuthed(): void {
  if (!hasInvoiceScanPoApproveCredentials()) {
    test.skip(
      true,
      "Invoice scan → PO → approve E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipInvoiceScanPoApproveIfGateDisabled(): void {
  if (!isInvoiceScanPoApproveE2EEnabled()) {
    test.skip(
      true,
      "Invoice scan → PO → approve E2E SKIPPED — set E2E_INVOICE_SCANNER_E2E=true (requires OPENAI_API_KEY on server)",
    );
  }
}
