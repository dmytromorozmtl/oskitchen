import { expect, test, type Page } from "@playwright/test";

import {
  ORDER_HUB_INCOMING_CHANNELS_HEADING,
  ORDER_HUB_PATH,
} from "@/lib/integrations/delivery-order-ingest-latency-e2e-policy";

export async function navigateToOrderHubForDeliveryIngest(page: Page): Promise<void> {
  await page.goto(ORDER_HUB_PATH);

  if (page.url().includes("/login")) {
    test.skip(true, "Delivery order ingest latency UI SKIPPED — dashboard auth required");
  }

  await expect(page.getByRole("heading", { name: /Order hub/i })).toBeVisible({
    timeout: 15_000,
  });
}

export async function assertOrderHubIncomingChannelsVisible(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: ORDER_HUB_INCOMING_CHANNELS_HEADING })).toBeVisible({
    timeout: 15_000,
  });
}

export async function runDeliveryIngestOrderHubProbe(page: Page): Promise<void> {
  await navigateToOrderHubForDeliveryIngest(page);
  await assertOrderHubIncomingChannelsVisible(page);
}
