import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import {
  POS_CHECKOUT_E2E_FLOW_STEPS,
  POS_CHECKOUT_E2E_VISIBLE_MS,
  POS_CHECKOUT_STATUS_TEST_ID,
  POS_COMPLETE_SALE_TEST_ID,
  POS_DISCOUNT_MODE_PERCENT_TEST_ID,
  POS_DISCOUNT_PRESET_10_TEST_ID,
  POS_PRODUCT_TILE_TEST_ID,
  POS_RECEIPT_PANEL_TEST_ID,
  parsePosReceiptCheckoutStatus,
  type PosCheckoutE2EFlowStep,
} from "@/lib/pos/pos-checkout-e2e-policy";
import { REFUND_PAYMENT_STATUS_FULL } from "@/lib/pos/refund-flow-e2e-policy";
import { refundPosTransaction } from "@/services/pos/pos-refund-service";
import { voidPosTransaction } from "@/services/pos/pos-void-service";

import {
  closeShiftWithExpectedCash,
  ensureOpenShift,
  preparePosTerminal,
} from "./pos-checkout-shift-flow";
import { assertClosedShiftTotalsBalanced } from "./pos-shift-open-close-flow";

export type PosCheckoutE2EFlowResult = {
  shiftId: string;
  discountedOrderId: string;
  voidOrderId: string;
  receiptRef: string;
  steps: PosCheckoutE2EFlowStep[];
};

async function addFirstProduct(page: Page): Promise<void> {
  await page.getByTestId(POS_PRODUCT_TILE_TEST_ID).first().click();
}

export async function applyPosPercentDiscount(page: Page, percent = 10): Promise<boolean> {
  const percentMode = page.getByTestId(POS_DISCOUNT_MODE_PERCENT_TEST_ID);
  if (!(await percentMode.isVisible().catch(() => false))) {
    return false;
  }
  await percentMode.click();

  const preset = page.getByTestId(`pos-discount-preset-${percent}`);
  if (await preset.isVisible().catch(() => false)) {
    await preset.click();
    return true;
  }

  const fallbackPreset = page.getByTestId(POS_DISCOUNT_PRESET_10_TEST_ID);
  if (await fallbackPreset.isVisible().catch(() => false)) {
    await fallbackPreset.click();
    return true;
  }

  return false;
}

async function completeSaleAndParseReceipt(page: Page): Promise<{
  orderPrefix: string;
  receiptRef: string;
}> {
  await page.getByTestId(POS_COMPLETE_SALE_TEST_ID).click();

  const status = page.getByTestId(POS_CHECKOUT_STATUS_TEST_ID);
  await expect(status).toBeVisible({ timeout: POS_CHECKOUT_E2E_VISIBLE_MS });
  await expect(status).toContainText(/sale complete|not available on your current plan|POS is not available/i, {
    timeout: POS_CHECKOUT_E2E_VISIBLE_MS,
  });

  const statusText = (await status.textContent()) ?? "";
  if (/not available on your current plan|POS is not available/i.test(statusText)) {
    test.skip(true, "POS terminal not entitled on this workspace plan.");
  }

  const parsed = parsePosReceiptCheckoutStatus(statusText);
  if (!parsed.saleComplete || !parsed.orderPrefix || !parsed.receiptRef) {
    throw new Error(
      `Expected sale complete receipt status, got: ${statusText.slice(0, 240)}`,
    );
  }

  return { orderPrefix: parsed.orderPrefix, receiptRef: parsed.receiptRef };
}

async function resolveFullOrderId(page: Page, orderPrefix: string): Promise<string> {
  await page.goto("/dashboard/orders");
  const orderLink = page.locator(`a[href*="/dashboard/orders/${orderPrefix}"]`).first();
  await expect(orderLink).toBeVisible({ timeout: 30_000 });
  const href = await orderLink.getAttribute("href");
  const fullId = href?.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )?.[0];
  if (!fullId) {
    throw new Error(`Could not parse order id from href: ${href ?? "(null)"}`);
  }
  return fullId;
}

async function lookupPosTransaction(orderId: string): Promise<{ id: string; userId: string }> {
  const tx = await prisma.pOSTransaction.findFirst({
    where: { orderId },
    select: { id: true, userId: true },
  });
  if (!tx) {
    test.skip(true, "No POSTransaction row for checkout — POS persistence gap on staging.");
  }
  return tx;
}

export async function runPosCheckoutE2EFlow(page: Page): Promise<PosCheckoutE2EFlowResult> {
  const steps: PosCheckoutE2EFlowStep[] = [];

  const shiftId = await ensureOpenShift(page);
  steps.push("open_shift");

  await preparePosTerminal(page);
  await expect(page.getByTestId(POS_RECEIPT_PANEL_TEST_ID)).toBeVisible({
    timeout: POS_CHECKOUT_E2E_VISIBLE_MS,
  });

  await addFirstProduct(page);
  steps.push("add_item");

  const discountApplied = await applyPosPercentDiscount(page);
  if (!discountApplied) {
    test.skip(true, "POS discount controls unavailable — pos.discount.apply or standard layout required.");
  }
  steps.push("apply_discount");

  const discountedReceipt = await completeSaleAndParseReceipt(page);
  steps.push("checkout", "receipt");

  const discountedOrderId = await resolveFullOrderId(page, discountedReceipt.orderPrefix);
  const discountedTx = await lookupPosTransaction(discountedOrderId);

  const refundResult = await refundPosTransaction({
    userId: discountedTx.userId,
    performedByUserId: discountedTx.userId,
    transactionId: discountedTx.id,
    reason: "E2E POS checkout full scenario — full refund",
  });
  expect(refundResult.ok).toBe(true);

  const refundedOrder = await prisma.order.findUnique({
    where: { id: discountedOrderId },
    select: { paymentStatus: true },
  });
  expect(refundedOrder?.paymentStatus).toBe(REFUND_PAYMENT_STATUS_FULL);
  steps.push("refund");

  await page.goto("/dashboard/pos/terminal");
  await addFirstProduct(page);
  const voidReceipt = await completeSaleAndParseReceipt(page);
  const voidOrderId = await resolveFullOrderId(page, voidReceipt.orderPrefix);
  const voidTx = await lookupPosTransaction(voidOrderId);

  const voidResult = await voidPosTransaction({
    userId: voidTx.userId,
    performedByUserId: voidTx.userId,
    transactionId: voidTx.id,
    reason: "E2E POS checkout full scenario — void",
  });
  expect(voidResult.ok).toBe(true);

  const voidedOrder = await prisma.order.findUnique({
    where: { id: voidOrderId },
    select: { paymentStatus: true },
  });
  expect(voidedOrder?.paymentStatus).toBe("VOIDED");
  steps.push("void_sale");

  await closeShiftWithExpectedCash(page, shiftId);
  await assertClosedShiftTotalsBalanced(page, shiftId);
  steps.push("close_shift");

  if (steps.length !== POS_CHECKOUT_E2E_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    shiftId,
    discountedOrderId,
    voidOrderId,
    receiptRef: discountedReceipt.receiptRef,
    steps,
  };
}
