import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { createWebhookEvent, markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { importSkipOrderToKitchen } from "@/services/integrations/skip/kitchen-import.service";
import { normalizeSkipOrder } from "@/services/integrations/skip/skip-marketplace";

export type SkipInboundResult = {
  ok: boolean;
  duplicate?: boolean;
  externalOrderId?: string;
  importedOrderId?: string;
  message?: string;
};

export async function processSkipInboundOrder(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  externalEventId: string;
  payload: Record<string, unknown>;
  webhookEventId?: string;
}): Promise<SkipInboundResult> {
  let eventId = input.webhookEventId;

  if (!eventId) {
    const event = await createWebhookEvent({
      userId: input.userId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      provider: IntegrationProvider.SKIP,
      topic: "orders",
      payload: input.payload,
      signatureValid: true,
      externalEventId: input.externalEventId,
    });

    if (event.duplicate) {
      return { ok: true, duplicate: true, message: "Duplicate webhook event" };
    }
    eventId = event.id;
  }

  try {
    const normalized = normalizeSkipOrder(input.payload);
    const external = await persistNormalizedExternalOrder({
      userId: input.userId,
      connectionId: input.connectionId,
      normalized,
    });

    const kitchen = await importSkipOrderToKitchen({
      userId: input.userId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      normalized,
      externalOrderRecordId: external.id,
    });

    await markWebhookProcessed(eventId, true);
    return {
      ok: true,
      externalOrderId: normalized.externalOrderId,
      importedOrderId: kitchen.orderId,
      message: kitchen.imported
        ? "External order persisted and imported to kitchen"
        : kitchen.duplicate
          ? "External order persisted (kitchen import already done)"
          : "External order persisted",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await markWebhookProcessed(eventId, false, msg);
    return { ok: false, message: msg };
  }
}
