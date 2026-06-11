import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test, type Page } from "@playwright/test";

import {
  INVOICE_SCANNER_AI_DISABLED_PATTERN,
  INVOICE_SCANNER_PATH,
  INVOICE_SCANNER_PO_NOTES_MARKER,
  INVOICE_SCANNER_PANEL_TEST_ID,
  INVOICE_SCAN_CONFIRM_BTN_TEST_ID,
  INVOICE_SCAN_GALLERY_INPUT_TEST_ID,
  INVOICE_SCAN_PO_APPROVE_FLOW_STEPS,
  INVOICE_SCAN_PO_APPROVE_VISIBLE_MS,
  INVOICE_SCAN_PO_RECEIVED_PATTERN,
  INVOICE_SCAN_REVIEW_PANEL_TEST_ID,
  INVOICE_SCAN_SUPPLY_CREATED_PATTERN,
  PURCHASING_ORDERS_PATH,
  parseSupplyCreatedOrderNumber,
  purchaseOrderDetailPath,
  type InvoiceScanPoApproveFlowStep,
} from "@/lib/qa/invoice-scan-po-approve-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type InvoiceScanPoApproveFlowResult = {
  orderNumber: string;
  steps: InvoiceScanPoApproveFlowStep[];
};

/** Minimal valid JPEG for gallery upload in E2E. */
const MINIMAL_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=";

function writeMinimalInvoiceFixture(): string {
  const fixturePath = join(process.cwd(), "e2e", "fixtures", "minimal-invoice-scan.jpg");
  writeFileSync(fixturePath, Buffer.from(MINIMAL_JPEG_BASE64, "base64"));
  return fixturePath;
}

export async function uploadInvoiceScanFixture(page: Page): Promise<void> {
  await page.goto(INVOICE_SCANNER_PATH);
  await skipIfLoginRedirect(page);
  await assertNoDashboardRscFailure(page);
  await expect(page.getByTestId(INVOICE_SCANNER_PANEL_TEST_ID)).toBeVisible({
    timeout: 15_000,
  });

  if (await page.getByText(INVOICE_SCANNER_AI_DISABLED_PATTERN).isVisible().catch(() => false)) {
    test.skip(true, "OPENAI_API_KEY not configured — enable vision scanning on the server.");
  }

  const fixturePath = writeMinimalInvoiceFixture();
  await page.getByTestId(INVOICE_SCAN_GALLERY_INPUT_TEST_ID).setInputFiles(fixturePath);
}

export async function waitForInvoiceScanReviewDraft(page: Page): Promise<void> {
  await expect(page.getByTestId(INVOICE_SCAN_REVIEW_PANEL_TEST_ID)).toBeVisible({
    timeout: INVOICE_SCAN_PO_APPROVE_VISIBLE_MS,
  });
  await expect(page.getByTestId("invoice-scan-line-0")).toBeVisible({
    timeout: INVOICE_SCAN_PO_APPROVE_VISIBLE_MS,
  });
}

export async function confirmInvoiceScanDraft(page: Page): Promise<string> {
  await page.getByTestId(INVOICE_SCAN_CONFIRM_BTN_TEST_ID).click();
  await expect(page.getByText(INVOICE_SCAN_SUPPLY_CREATED_PATTERN)).toBeVisible({
    timeout: INVOICE_SCAN_PO_APPROVE_VISIBLE_MS,
  });
  const toastText = (await page.getByText(INVOICE_SCAN_SUPPLY_CREATED_PATTERN).textContent()) ?? "";
  const orderNumber = parseSupplyCreatedOrderNumber(toastText);
  if (!orderNumber) {
    throw new Error(`Could not parse PO number from toast: ${toastText.slice(0, 200)}`);
  }
  await page.waitForLoadState("domcontentloaded");
  return orderNumber;
}

export async function verifyPurchaseOrderFromScan(
  page: Page,
  orderNumber: string,
): Promise<void> {
  await page.goto(PURCHASING_ORDERS_PATH);
  await assertNoDashboardRscFailure(page);
  await expect(page.getByRole("heading", { name: /purchase orders/i })).toBeVisible({
    timeout: 15_000,
  });

  const poLink = page.getByRole("link", { name: new RegExp(orderNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }).first();
  await expect(poLink).toBeVisible({ timeout: INVOICE_SCAN_PO_APPROVE_VISIBLE_MS });
  const href = await poLink.getAttribute("href");
  const poId = href?.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )?.[0];
  if (!poId) {
    throw new Error(`Could not parse PO id from href: ${href ?? "(null)"}`);
  }

  await page.goto(purchaseOrderDetailPath(poId));
  await assertNoDashboardRscFailure(page);
  await expect(page.getByText(INVOICE_SCAN_PO_RECEIVED_PATTERN)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(INVOICE_SCANNER_PO_NOTES_MARKER)).toBeVisible({
    timeout: 15_000,
  });
}

export async function runInvoiceScanPoApproveFlow(
  page: Page,
): Promise<InvoiceScanPoApproveFlowResult> {
  const steps: InvoiceScanPoApproveFlowStep[] = [];

  await uploadInvoiceScanFixture(page);
  steps.push("scan_upload");

  await waitForInvoiceScanReviewDraft(page);
  steps.push("review_draft");

  const orderNumber = await confirmInvoiceScanDraft(page);
  steps.push("confirm_approve");

  await verifyPurchaseOrderFromScan(page, orderNumber);
  steps.push("verify_po");

  if (steps.length !== INVOICE_SCAN_PO_APPROVE_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return { orderNumber, steps };
}
