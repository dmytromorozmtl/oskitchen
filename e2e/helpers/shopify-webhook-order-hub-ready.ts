import { IntegrationProvider } from "@prisma/client";
import { test } from "@playwright/test";

import { getWebhookSecret } from "@/lib/integrations/decrypt-connection";
import { signShopifyWebhookBody } from "@/lib/integrations/shopify-webhook-order-hub-e2e-policy";
import { prisma } from "@/lib/prisma";

export { signShopifyWebhookBody };

export const hasShopifyWebhookOrderHubDb = Boolean(process.env.DATABASE_URL?.trim());

export type ShopifyWebhookOrderHubFixture = {
  connectionId: string;
  shopDomain: string;
  webhookSecret: string;
  userId: string;
};

export async function resolveShopifyWebhookOrderHubFixture(): Promise<ShopifyWebhookOrderHubFixture | null> {
  const connectionId =
    process.env.SHOPIFY_SMOKE_CONNECTION_ID?.trim() ??
    process.env.CHANNEL_SMOKE_CONNECTION_ID?.trim();
  if (!connectionId) return null;

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
  });
  if (!conn || conn.provider !== IntegrationProvider.SHOPIFY) return null;

  const shopDomain = conn.shopDomain?.trim();
  if (!shopDomain) return null;

  const webhookSecret =
    getWebhookSecret(conn) ?? process.env.SHOPIFY_WEBHOOK_SECRET?.trim() ?? null;
  if (!webhookSecret) return null;

  return {
    connectionId: conn.id,
    shopDomain,
    webhookSecret,
    userId: conn.userId,
  };
}

export function skipShopifyWebhookOrderHubIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Shopify webhook→order hub E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipShopifyWebhookOrderHubIfNoDb(): void {
  if (!hasShopifyWebhookOrderHubDb) {
    test.skip(true, "DATABASE_URL required for Shopify webhook→order hub E2E");
  }
}
