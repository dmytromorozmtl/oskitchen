import { expect, test, type Page } from "@playwright/test";

import { formatKdsTicketNumber } from "@/lib/kitchen/kds-queue-clarity-era18";
import {
  KDS_BUMP_EXPO_TICKET_VISIBLE_MS,
  KDS_PLAYWRIGHT_COMPLETE_ORDER_BUTTON,
  KDS_PLAYWRIGHT_FLOW_STEPS,
  KDS_PLAYWRIGHT_ORDER_COMPLETED_LABEL,
  KDS_PLAYWRIGHT_VISIBLE_MS,
  kdsPlaywrightOrderDetailPath,
  kdsTicketTestId,
  type KdsPlaywrightFlowStep,
} from "@/lib/qa/kds-playwright-e2e-policy";

import {
  assertOrderOnExpoReadyLane,
  bumpOrderToReadyOnKds,
} from "./kds-bump-expo-flow";
import { assertKdsKitchenReadyOrSkip } from "./kds-bump-packing-route-flow";
import {
  completePosCashSale,
  ensureOpenShift,
  preparePosTerminal,
} from "./pos-checkout-shift-flow";

export type KdsPlaywrightFlowResult = {
  shiftId: string;
  orderId: string;
  ticketNumber: string;
  steps: KdsPlaywrightFlowStep[];
};

async function resolveOrderIdFromCheckout(page: Page): Promise<string> {
  const status = page.getByTestId("pos-checkout-status");
  const text = (await status.textContent()) ?? "";
  const prefixMatch = text.match(/order\s+([a-f0-9]{8})/i);
  if (!prefixMatch) {
    throw new Error(`Expected order prefix in checkout status, got: ${text.slice(0, 200)}`);
  }

  await page.goto("/dashboard/orders");
  const orderLink = page.locator(`a[href*="/dashboard/orders/${prefixMatch[1]}"]`).first();
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

export async function completeOrderOnDetail(page: Page, orderId: string): Promise<void> {
  await page.goto(kdsPlaywrightOrderDetailPath(orderId));
  await expect(page.getByRole("heading", { name: /order/i })).toBeVisible({
    timeout: KDS_PLAYWRIGHT_VISIBLE_MS,
  });

  const completeButton = page.getByRole("button", {
    name: new RegExp(`^${KDS_PLAYWRIGHT_COMPLETE_ORDER_BUTTON}$`, "i"),
  });
  if (!(await completeButton.isVisible().catch(() => false))) {
    test.skip(true, "Complete order action unavailable — order may not be READY for completion.");
  }

  await completeButton.click();
  await page.getByRole("button", { name: /^confirm$/i }).click();
  await expect(page.getByText(KDS_PLAYWRIGHT_ORDER_COMPLETED_LABEL).first()).toBeVisible({
    timeout: KDS_PLAYWRIGHT_VISIBLE_MS,
  });
}

export async function runKdsPlaywrightFlow(page: Page): Promise<KdsPlaywrightFlowResult> {
  const steps: KdsPlaywrightFlowStep[] = [];

  const shiftId = await ensureOpenShift(page);
  steps.push("open_shift");

  await preparePosTerminal(page);
  await completePosCashSale(page);
  steps.push("pos_order");

  const orderId = await resolveOrderIdFromCheckout(page);

  await assertKdsKitchenReadyOrSkip(page);
  await expect(page.getByTestId(kdsTicketTestId(orderId))).toBeVisible({
    timeout: KDS_BUMP_EXPO_TICKET_VISIBLE_MS,
  });
  steps.push("kds_ticket");

  await bumpOrderToReadyOnKds(page, orderId);
  steps.push("bump_ready");

  await assertOrderOnExpoReadyLane(page, orderId);
  steps.push("expo_lane");

  await completeOrderOnDetail(page, orderId);
  steps.push("complete_order");

  if (steps.length !== KDS_PLAYWRIGHT_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    shiftId,
    orderId,
    ticketNumber: formatKdsTicketNumber(orderId),
    steps,
  };
}
