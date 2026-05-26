import { prisma } from "@/lib/prisma";
import {
  decodeWebhookDeliveryCursor,
  encodeWebhookDeliveryCursor,
  parseWebhookDeliveryMetadata,
  WEBHOOK_DELIVERY_EVENT_NAMES,
  type WebhookDeliveryEventName,
} from "@/lib/storefront/webhook-delivery-metadata";

export type WebhookDeliveryLogEntry = {
  id: string;
  deliveryId: string;
  status: "delivered" | "failed";
  pageId: string;
  pageSlug: string;
  urlHost: string;
  createdAt: string;
};

export type WebhookDeliveryLogPage = {
  entries: WebhookDeliveryLogEntry[];
  nextCursor: string | null;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const RETENTION_DAYS = 90;
const MAX_EVENTS_PER_STOREFRONT = 500;

function toLogEntry(row: {
  id: string;
  eventName: string;
  metadataJson: unknown;
  createdAt: Date;
}): WebhookDeliveryLogEntry | null {
  const meta = parseWebhookDeliveryMetadata(row.metadataJson);
  if (!meta) return null;
  const status: WebhookDeliveryLogEntry["status"] =
    row.eventName === "webhook.delivered" ? "delivered" : "failed";
  return {
    id: row.id,
    deliveryId: meta.deliveryId,
    status,
    pageId: meta.pageId,
    pageSlug: meta.pageSlug,
    urlHost: meta.urlHost,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Recent page-publish webhook delivery attempts (newest first). */
export async function getStorefrontWebhookDeliveryLog(
  storefrontId: string,
  options?: { limit?: number; cursor?: string | null },
): Promise<WebhookDeliveryLogPage> {
  const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const decoded = options?.cursor ? decodeWebhookDeliveryCursor(options.cursor) : null;

  const rows = await prisma.storefrontConversionEvent.findMany({
    where: {
      storefrontId,
      eventName: { in: [...WEBHOOK_DELIVERY_EVENT_NAMES] },
      ...(decoded
        ? {
            OR: [
              { createdAt: { lt: decoded.createdAt } },
              { createdAt: decoded.createdAt, id: { lt: decoded.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: { id: true, eventName: true, metadataJson: true, createdAt: true },
  });

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const entries = slice
    .map((row) => toLogEntry(row))
    .filter((e): e is WebhookDeliveryLogEntry => e != null);

  const last = slice[slice.length - 1];
  const nextCursor =
    hasMore && last ? encodeWebhookDeliveryCursor(last.createdAt, last.id) : null;

  return { entries, nextCursor };
}

export async function getWebhookDeliveryEventForStorefront(input: {
  storefrontId: string;
  conversionEventId: string;
}): Promise<{
  id: string;
  eventName: WebhookDeliveryEventName;
  metadata: ReturnType<typeof parseWebhookDeliveryMetadata>;
} | null> {
  const row = await prisma.storefrontConversionEvent.findFirst({
    where: {
      id: input.conversionEventId,
      storefrontId: input.storefrontId,
      eventName: { in: [...WEBHOOK_DELIVERY_EVENT_NAMES] },
    },
    select: { id: true, eventName: true, metadataJson: true },
  });
  if (!row) return null;
  const metadata = parseWebhookDeliveryMetadata(row.metadataJson);
  if (!metadata) return null;
  if (row.eventName !== "webhook.delivered" && row.eventName !== "webhook.failed") return null;
  return { id: row.id, eventName: row.eventName, metadata };
}

async function capWebhookEventsForStorefront(storefrontId: string): Promise<number> {
  const count = await prisma.storefrontConversionEvent.count({
    where: {
      storefrontId,
      eventName: { in: [...WEBHOOK_DELIVERY_EVENT_NAMES] },
    },
  });
  if (count <= MAX_EVENTS_PER_STOREFRONT) return 0;

  const excess = count - MAX_EVENTS_PER_STOREFRONT;
  const oldest = await prisma.storefrontConversionEvent.findMany({
    where: {
      storefrontId,
      eventName: { in: [...WEBHOOK_DELIVERY_EVENT_NAMES] },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: excess,
    select: { id: true },
  });
  if (!oldest.length) return 0;

  const result = await prisma.storefrontConversionEvent.deleteMany({
    where: { id: { in: oldest.map((o) => o.id) } },
  });
  return result.count;
}

/** Drop webhook delivery telemetry older than 90d and cap each storefront at 500 rows. */
export async function purgeStorefrontWebhookDeliveryLogs(): Promise<{
  deletedByAge: number;
  deletedByCap: number;
  storefrontsCapped: number;
}> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const ageResult = await prisma.storefrontConversionEvent.deleteMany({
    where: {
      eventName: { in: [...WEBHOOK_DELIVERY_EVENT_NAMES] },
      createdAt: { lt: cutoff },
    },
  });

  const storefrontRows = await prisma.storefrontConversionEvent.findMany({
    where: { eventName: { in: [...WEBHOOK_DELIVERY_EVENT_NAMES] } },
    distinct: ["storefrontId"],
    select: { storefrontId: true },
  });

  let deletedByCap = 0;
  let storefrontsCapped = 0;
  for (const { storefrontId } of storefrontRows) {
    const n = await capWebhookEventsForStorefront(storefrontId);
    if (n > 0) {
      deletedByCap += n;
      storefrontsCapped++;
    }
  }

  return {
    deletedByAge: ageResult.count,
    deletedByCap,
    storefrontsCapped,
  };
}
