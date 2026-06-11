/**
 * Blueprint P1-45 — Invoice scan → PO → approve E2E (AI invoice flow).
 *
 * @see e2e/invoice-scan-po-approve.spec.ts
 * @see components/inventory/invoice-scanner-mobile.tsx
 * @see services/ai/invoice-scanner-service.ts
 */

import { INVOICE_SCANNER_NOTES_MARKER } from "@/lib/inventory/invoice-scanner-types";

export const INVOICE_SCAN_PO_APPROVE_E2E_POLICY_ID =
  "invoice-scan-po-approve-e2e-v1" as const;

export const INVOICE_SCANNER_PATH = "/dashboard/inventory/invoice-scanner" as const;
export const PURCHASING_ORDERS_PATH = "/dashboard/purchasing/purchase-orders" as const;

export const INVOICE_SCANNER_PANEL_TEST_ID = "invoice-scanner-panel" as const;
export const INVOICE_SCAN_GALLERY_INPUT_TEST_ID = "invoice-scan-gallery-input" as const;
export const INVOICE_SCAN_REVIEW_PANEL_TEST_ID = "invoice-scan-review-panel" as const;
export const INVOICE_SCAN_CONFIRM_BTN_TEST_ID = "invoice-scan-confirm-btn" as const;
export const INVOICE_SCAN_HISTORY_TEST_ID = "invoice-scan-history" as const;

export const INVOICE_SCAN_SUPPLY_CREATED_PATTERN =
  /Supply created — PO .+, \d+ line\(s\) received\./i;
export const INVOICE_SCAN_PO_RECEIVED_PATTERN = /received/i;
export const INVOICE_SCANNER_AI_DISABLED_PATTERN =
  /Set OPENAI_API_KEY on the server to enable vision scanning/i;

export const INVOICE_SCAN_PO_APPROVE_VISIBLE_MS = 90_000 as const;

export const INVOICE_SCAN_PO_APPROVE_E2E_SPEC = "e2e/invoice-scan-po-approve.spec.ts" as const;
export const INVOICE_SCAN_PO_APPROVE_FLOW_HELPER =
  "e2e/helpers/invoice-scan-po-approve-flow.ts" as const;
export const INVOICE_SCAN_PO_APPROVE_READY_HELPER =
  "e2e/helpers/invoice-scan-po-approve-ready.ts" as const;
export const INVOICE_SCAN_PO_APPROVE_AUDIT_SCRIPT =
  "scripts/audit-invoice-scan-po-approve-e2e.ts" as const;
export const INVOICE_SCAN_PO_APPROVE_NPM_SCRIPT = "audit:invoice-scan-po-approve-e2e" as const;
export const INVOICE_SCAN_PO_APPROVE_UNIT_TEST =
  "tests/unit/invoice-scan-po-approve-e2e.test.ts" as const;
export const INVOICE_SCAN_PO_APPROVE_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INVOICE_SCAN_PO_APPROVE_FLOW_STEPS = [
  "scan_upload",
  "review_draft",
  "confirm_approve",
  "verify_po",
] as const;

export type InvoiceScanPoApproveFlowStep = (typeof INVOICE_SCAN_PO_APPROVE_FLOW_STEPS)[number];

export const INVOICE_SCANNER_PO_NOTES_MARKER = INVOICE_SCANNER_NOTES_MARKER;

export function purchaseOrderDetailPath(poId: string): string {
  return `/dashboard/purchasing/purchase-orders/${poId}`;
}

export function parseSupplyCreatedOrderNumber(text: string): string | null {
  const match = text.match(/Supply created — PO ([^,]+),/i);
  return match?.[1]?.trim() ?? null;
}

export function hasInvoiceScanPoApproveCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isInvoiceScanPoApproveE2EEnabled(): boolean {
  return process.env.E2E_INVOICE_SCANNER_E2E?.trim() === "true";
}
