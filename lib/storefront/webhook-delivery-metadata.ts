export const WEBHOOK_DELIVERY_EVENT_NAMES = ["webhook.delivered", "webhook.failed"] as const;

export type WebhookDeliveryEventName = (typeof WEBHOOK_DELIVERY_EVENT_NAMES)[number];

export type WebhookDeliveryMetadata = {
  deliveryId: string;
  pageId: string;
  pageSlug: string;
  pageTitle?: string;
  urlHost: string;
  publishedAt?: string;
  redeliveredFrom?: string;
};

export function parseWebhookDeliveryMetadata(raw: unknown): WebhookDeliveryMetadata | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const deliveryId = typeof o.deliveryId === "string" ? o.deliveryId.trim() : "";
  const pageId = typeof o.pageId === "string" ? o.pageId.trim() : "";
  const pageSlug = typeof o.pageSlug === "string" ? o.pageSlug.trim() : "";
  const urlHost = typeof o.urlHost === "string" ? o.urlHost.trim() : "";
  if (!deliveryId || !pageId || !pageSlug || !urlHost) return null;
  return {
    deliveryId,
    pageId,
    pageSlug,
    urlHost,
    pageTitle: typeof o.pageTitle === "string" ? o.pageTitle : undefined,
    publishedAt: typeof o.publishedAt === "string" ? o.publishedAt : undefined,
    redeliveredFrom: typeof o.redeliveredFrom === "string" ? o.redeliveredFrom : undefined,
  };
}

export function encodeWebhookDeliveryCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`;
}

export function decodeWebhookDeliveryCursor(cursor: string): { createdAt: Date; id: string } | null {
  const sep = cursor.indexOf("|");
  if (sep <= 0) return null;
  const createdAt = new Date(cursor.slice(0, sep));
  const id = cursor.slice(sep + 1);
  if (Number.isNaN(createdAt.getTime()) || !id) return null;
  return { createdAt, id };
}
