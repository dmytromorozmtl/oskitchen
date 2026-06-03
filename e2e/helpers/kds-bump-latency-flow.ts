import { expect, type Page } from "@playwright/test";

import {
  KDS_BUMP_NEXT_BUTTON_TESTID,
  KDS_KITCHEN_PATH,
  KDS_SECTION_READY_TESTID,
  kdsTicketNextActionTestId,
  kdsTicketTestId,
} from "@/lib/kitchen/kds-bump-latency-e2e-policy";
import { KDS_BUMP_PACKING_ROUTE_TICKET_VISIBLE_MS } from "@/lib/kitchen/kds-bump-packing-route-e2e-policy";

import { assertKdsKitchenReadyOrSkip } from "./kds-bump-packing-route-flow";

export async function measureKdsBumpReflectLatency(
  page: Page,
  orderId: string,
): Promise<number> {
  await assertKdsKitchenReadyOrSkip(page);

  const ticket = page.getByTestId(kdsTicketTestId(orderId));
  await expect(ticket).toBeVisible({ timeout: KDS_BUMP_PACKING_ROUTE_TICKET_VISIBLE_MS });

  const bumpNext = page.getByTestId(KDS_BUMP_NEXT_BUTTON_TESTID);
  const ticketBump = page.getByTestId(kdsTicketNextActionTestId(orderId));

  const started = Date.now();

  if (await bumpNext.isVisible().catch(() => false)) {
    await bumpNext.click();
  } else {
    await expect(ticketBump).toBeVisible({ timeout: 5_000 });
    await ticketBump.click();
  }

  await expect(
    page.getByTestId(KDS_SECTION_READY_TESTID).getByTestId(kdsTicketTestId(orderId)),
  ).toBeVisible({ timeout: 15_000 });

  return Date.now() - started;
}

export async function navigateToKdsKitchen(page: Page): Promise<void> {
  await page.goto(KDS_KITCHEN_PATH);
  await assertKdsKitchenReadyOrSkip(page);
}
