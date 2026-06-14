import { expect, test, type Page } from "@playwright/test";

import { kdsTicketTestId } from "@/lib/kitchen/kds-bump-expo-e2e-policy";
import {
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS,
} from "@/lib/integrations/shopify-webhook-kds-e2e-p0-14-policy";
import { KDS_KITCHEN_PATH } from "@/lib/qa/kds-playwright-e2e-policy";
import { runShopifyWebhookKdsE2EChain } from "@/services/integrations/shopify-webhook-kds-e2e-p0-14";

import { assertKdsKitchenReady } from "./kds-kitchen-ready";
import { resolveShopifyWebhookOrderHubFixture } from "./shopify-webhook-order-hub-ready";

export const SHOPIFY_WEBHOOK_KDS_TICKET_VISIBLE_MS = 15_000 as const;

export async function ingestShopifyWebhookAndAssertKds(page: Page): Promise<{
  externalOrderId: string;
  importedOrderId: string;
  kitchenTaskId: string | null;
  webhookEventId: string | null;
}> {
  const fixture = await resolveShopifyWebhookOrderHubFixture();
  if (!fixture) {
    test.skip(
      true,
      "SHOPIFY_SMOKE_CONNECTION_ID Shopify connection + shop domain + webhook secret required.",
    );
  }

  const stamp = Date.now().toString().slice(-8);
  const { prisma } = await import("@/lib/prisma");
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: fixture.connectionId },
    select: { workspaceId: true },
  });

  const chain = await runShopifyWebhookKdsE2EChain({
    prisma,
    userId: fixture.userId,
    workspaceId: conn?.workspaceId,
    connectionId: fixture.connectionId,
    webhookSecret: fixture.webhookSecret,
    externalOrderId: stamp,
  });

  for (const stepId of SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS) {
    expect(chain.steps.some((step) => step.id === stepId)).toBe(true);
  }
  expect(chain.overall).toBe("PASSED");
  expect(chain.importedOrderId).toBeTruthy();
  expect(chain.webhookEventId).toBeTruthy();
  expect(chain.kitchenTaskId).toBeTruthy();

  const orderId = chain.importedOrderId!;
  await page.goto(KDS_KITCHEN_PATH);
  await assertKdsKitchenReady(page);

  const ticket = page.getByTestId(kdsTicketTestId(orderId));
  await expect(ticket).toBeVisible({ timeout: SHOPIFY_WEBHOOK_KDS_TICKET_VISIBLE_MS });

  return {
    externalOrderId: chain.externalOrderId,
    importedOrderId: orderId,
    kitchenTaskId: chain.kitchenTaskId,
    webhookEventId: chain.webhookEventId,
  };
}
