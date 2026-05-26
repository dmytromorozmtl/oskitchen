import { createHmac, randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { decryptStorefrontWebhookSecret } from "@/lib/storefront/storefront-webhook-secret";

const MAX_ATTEMPTS = 3;
const RETRY_MS = [0, 2_000, 8_000];

export type StorefrontWebhookPayload = {
  event: string;
  storeSlug: string;
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  publishedAt: string;
};

/** HMAC-SHA256 over `{timestamp}.{body}` — used in X-KitchenOS-Signature. */
export function signStorefrontWebhookPayload(secret: string, body: string, timestamp: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

async function postWithRetries(input: {
  url: string;
  body: string;
  headers: Record<string, string>;
}): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (RETRY_MS[attempt]) {
      await new Promise((r) => setTimeout(r, RETRY_MS[attempt]));
    }
    try {
      const res = await fetch(input.url, {
        method: "POST",
        headers: input.headers,
        body: input.body,
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok) return true;
      logger.warn("storefront webhook non-2xx", {
        status: res.status,
        attempt: attempt + 1,
        url: input.url.slice(0, 60),
      });
    } catch (e) {
      logger.warn("storefront webhook attempt failed", { attempt: attempt + 1, error: String(e) });
    }
  }
  return false;
}

/** Fire-and-forget POST with HMAC signature + retries (Zapier, Make, etc.). */
export async function dispatchStorefrontPagePublishedWebhook(input: {
  storefrontId: string;
  webhookUrl: string;
  webhookSecret?: string | null;
  storeSlug: string;
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  publishedAt: string;
}): Promise<void> {
  const url = input.webhookUrl.trim();
  if (!url.startsWith("https://")) return;

  const payload: StorefrontWebhookPayload = {
    event: "storefront.page.published",
    storeSlug: input.storeSlug,
    pageId: input.pageId,
    pageSlug: input.pageSlug,
    pageTitle: input.pageTitle,
    publishedAt: input.publishedAt,
  };
  const body = JSON.stringify(payload);
  const deliveryId = randomBytes(12).toString("hex");
  const timestamp = String(Math.floor(Date.now() / 1000));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-KitchenOS-Event": payload.event,
    "X-KitchenOS-Delivery-Id": deliveryId,
    "X-KitchenOS-Timestamp": timestamp,
  };

  const secret = decryptStorefrontWebhookSecret(input.webhookSecret)?.trim();
  if (secret) {
    headers["X-KitchenOS-Signature"] = `sha256=${signStorefrontWebhookPayload(secret, body, timestamp)}`;
  }

  const ok = await postWithRetries({ url, body, headers });

  await prisma.storefrontConversionEvent
    .create({
      data: {
        storefrontId: input.storefrontId,
        eventName: ok ? "webhook.delivered" : "webhook.failed",
        metadataJson: {
          deliveryId,
          pageId: input.pageId,
          pageSlug: input.pageSlug,
          pageTitle: input.pageTitle,
          urlHost: new URL(url).host,
          publishedAt: input.publishedAt,
        },
      },
    })
    .catch(() => {
      /* telemetry optional */
    });
}
