import { IntegrationProvider } from "@prisma/client";
import { test } from "@playwright/test";

import { getWebhookSecret } from "@/lib/integrations/decrypt-connection";
import { signWooWebhookBody } from "@/lib/integrations/woocommerce-webhook-order-hub-e2e-policy";
import { prisma } from "@/lib/prisma";

export { signWooWebhookBody };

export const hasWooWebhookOrderHubDb = Boolean(process.env.DATABASE_URL?.trim());

export type WooWebhookOrderHubFixture = {
  connectionId: string;
  webhookSecret: string;
  userId: string;
};

export async function resolveWooWebhookOrderHubFixture(): Promise<WooWebhookOrderHubFixture | null> {
  const connectionId = process.env.CHANNEL_SMOKE_CONNECTION_ID?.trim();
  if (!connectionId) return null;

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
  });
  if (!conn || conn.provider !== IntegrationProvider.WOOCOMMERCE) return null;

  const webhookSecret =
    getWebhookSecret(conn) ?? process.env.WOOCOMMERCE_WEBHOOK_SECRET?.trim() ?? null;
  if (!webhookSecret) return null;

  return {
    connectionId: conn.id,
    webhookSecret,
    userId: conn.userId,
  };
}

export function skipWooWebhookOrderHubIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "WooCommerce webhook→order hub E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipWooWebhookOrderHubIfNoDb(): void {
  if (!hasWooWebhookOrderHubDb) {
    test.skip(true, "DATABASE_URL required for WooCommerce webhook→order hub E2E");
  }
}
