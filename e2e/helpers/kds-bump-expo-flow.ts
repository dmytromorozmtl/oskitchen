import { expect, test, type Page } from "@playwright/test";

import { formatKdsTicketNumber } from "@/lib/kitchen/kds-queue-clarity-era18";
import {
  KDS_BUMP_EXPO_EXPO_VISIBLE_MS,
  KDS_BUMP_EXPO_FLOW_STEPS,
  KDS_BUMP_EXPO_TICKET_VISIBLE_MS,
  KDS_BUMP_NEXT_BUTTON_TEST_ID,
  KDS_EXPO_LANE_READY_TEST_ID,
  KDS_EXPO_PATH,
  KDS_EXPO_TICKET_TEST_ID,
  KDS_EXPO_VIEW_ROOT_TEST_ID,
  KDS_SECTION_READY_TEST_ID,
  kdsTicketNextActionTestId,
  kdsTicketTestId,
  type KdsBumpExpoFlowStep,
} from "@/lib/kitchen/kds-bump-expo-e2e-policy";

import { assertNoDashboardRscFailure } from "./dashboard-smoke";
import { assertKdsKitchenReadyOrSkip } from "./kds-bump-packing-route-flow";

export type KdsBumpExpoFlowResult = {
  orderId: string;
  ticketNumber: string;
  steps: KdsBumpExpoFlowStep[];
};

export async function createPosKitchenOrder(page: Page): Promise<string> {
  await page.goto("/dashboard/pos/terminal");

  const needRegister = page.getByRole("link", { name: /add register/i });
  const needStaff = page.getByRole("link", { name: /open staff/i });
  if (await needRegister.isVisible().catch(() => false)) {
    test.skip(true, "No POS register — add one under POS → Registers.");
  }
  if (await needStaff.isVisible().catch(() => false)) {
    test.skip(true, "No active staff — add under Staff.");
  }

  const tile = page.getByTestId("pos-product-tile").first();
  if ((await tile.count()) === 0) {
    test.skip(true, "No POS-visible products — enable posVisible on menu items or seed catalog.");
  }

  await tile.click();
  await page.getByTestId("pos-complete-sale").click();

  const status = page.getByTestId("pos-checkout-status");
  await expect(status).toBeVisible({ timeout: 60_000 });
  await expect(status).toContainText(/sale complete|not available on your current plan|POS is not available/i, {
    timeout: 60_000,
  });

  const text = (await status.textContent()) ?? "";
  if (/not available on your current plan|POS is not available/i.test(text)) {
    test.skip(true, "POS terminal not entitled on this workspace plan.");
  }

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

export async function bumpOrderToReadyOnKds(page: Page, orderId: string): Promise<void> {
  await assertKdsKitchenReadyOrSkip(page);

  const ticket = page.getByTestId(kdsTicketTestId(orderId));
  await expect(ticket).toBeVisible({ timeout: KDS_BUMP_EXPO_TICKET_VISIBLE_MS });

  const bumpNext = page.getByTestId(KDS_BUMP_NEXT_BUTTON_TEST_ID);
  const ticketBump = page.getByTestId(kdsTicketNextActionTestId(orderId));
  if (await bumpNext.isVisible().catch(() => false)) {
    await bumpNext.click();
  } else {
    await expect(ticketBump).toBeVisible({ timeout: 5_000 });
    await ticketBump.click();
  }

  await expect(
    page.getByTestId(KDS_SECTION_READY_TEST_ID).getByTestId(kdsTicketTestId(orderId)),
  ).toBeVisible({ timeout: KDS_BUMP_EXPO_TICKET_VISIBLE_MS });
}

export async function assertOrderOnExpoReadyLane(page: Page, orderId: string): Promise<void> {
  await page.goto(KDS_EXPO_PATH);
  await expect(page.getByRole("heading", { name: /expo view/i })).toBeVisible({
    timeout: KDS_BUMP_EXPO_EXPO_VISIBLE_MS,
  });
  await expect(page.getByTestId(KDS_EXPO_VIEW_ROOT_TEST_ID)).toBeVisible({
    timeout: KDS_BUMP_EXPO_EXPO_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);

  const readyLane = page.getByTestId(KDS_EXPO_LANE_READY_TEST_ID);
  await expect(readyLane).toBeVisible({ timeout: KDS_BUMP_EXPO_EXPO_VISIBLE_MS });

  const ticketNumber = formatKdsTicketNumber(orderId);
  await expect(
    readyLane.getByTestId(KDS_EXPO_TICKET_TEST_ID).filter({ hasText: ticketNumber }),
  ).toBeVisible({ timeout: KDS_BUMP_EXPO_EXPO_VISIBLE_MS });
}

export async function runKdsBumpExpoFlow(page: Page): Promise<KdsBumpExpoFlowResult> {
  const steps: KdsBumpExpoFlowStep[] = [];

  const orderId = await createPosKitchenOrder(page);
  steps.push("pos_order");

  await assertKdsKitchenReadyOrSkip(page);
  await expect(page.getByTestId(kdsTicketTestId(orderId))).toBeVisible({
    timeout: KDS_BUMP_EXPO_TICKET_VISIBLE_MS,
  });
  steps.push("kds_ticket");

  await bumpOrderToReadyOnKds(page, orderId);
  steps.push("bump_ready");

  await assertOrderOnExpoReadyLane(page, orderId);
  steps.push("expo_lane");

  if (steps.length !== KDS_BUMP_EXPO_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    orderId,
    ticketNumber: formatKdsTicketNumber(orderId),
    steps,
  };
}
