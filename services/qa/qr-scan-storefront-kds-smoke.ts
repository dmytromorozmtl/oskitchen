import {
  KitchenTaskSource,
  KitchenTaskStatus,
  KitchenTaskType,
  type PrismaClient,
} from "@prisma/client";

export const QR_SCAN_STOREFRONT_ORDER_CREATED_EVENT = "order.created" as const;

export async function waitForOutboundOrderCreatedWebhook(input: {
  prisma: PrismaClient;
  userId: string;
  orderId: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; deliveryId: string | null }> {
  const timeoutMs = input.timeoutMs ?? 15_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const rows = await input.prisma.outboundWebhookDelivery.findMany({
      where: {
        userId: input.userId,
        eventType: QR_SCAN_STOREFRONT_ORDER_CREATED_EVENT,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, payloadJson: true },
    });

    for (const row of rows) {
      const payload = JSON.stringify(row.payloadJson);
      if (payload.includes(input.orderId)) {
        return { ok: true, deliveryId: row.id };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { ok: false, deliveryId: null };
}

export async function waitForKitchenTaskForStorefrontOrder(input: {
  prisma: PrismaClient;
  orderId: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; taskId: string | null }> {
  const timeoutMs = input.timeoutMs ?? 10_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const row = await input.prisma.kitchenTask.findFirst({
      where: { relatedOrderId: input.orderId },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    if (row) {
      return { ok: true, taskId: row.id };
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { ok: false, taskId: null };
}

/** Ensures KitchenTask exists for QR/storefront KDS smoke when queue auto-provision is absent. */
export async function ensureKitchenTaskForQrStorefrontKdsSmoke(input: {
  prisma: PrismaClient;
  userId: string;
  workspaceId?: string | null;
  orderId: string;
  storeSlug: string;
}): Promise<{ ok: boolean; taskId: string; created: boolean }> {
  const existing = await input.prisma.kitchenTask.findFirst({
    where: { relatedOrderId: input.orderId },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return { ok: true, taskId: existing.id, created: false };
  }

  const row = await input.prisma.kitchenTask.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId ?? undefined,
      title: `QR storefront order ${input.orderId.slice(0, 8)}`,
      taskType: KitchenTaskType.PREP,
      sourceType: KitchenTaskSource.STORE_FRONT,
      sourceLabel: "qr-storefront-smoke",
      relatedOrderId: input.orderId,
      status: KitchenTaskStatus.OPEN,
      metadataJson: {
        smoke: true,
        storeSlug: input.storeSlug,
        channel: "qr_scan_storefront",
      },
    },
    select: { id: true },
  });

  return { ok: true, taskId: row.id, created: true };
}
