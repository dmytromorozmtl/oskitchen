import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { createWebhookEvent, markWebhookProcessed } from "@/lib/webhooks/webhook-event-store";
import { normalizeDoorDashOrder } from "@/services/integrations/doordash/doordash-marketplace";
import { importDoorDashOrderToKitchen } from "@/services/integrations/doordash/kitchen-import.service";

export type DoorDashInboundResult = {
  ok: boolean;
  duplicate?: boolean;
  externalOrderId?: string;
  importedOrderId?: string;
  message?: string;
};

/**
 * Idempotent inbound DoorDash order webhook → external_orders.
 * Prefer the HTTP route which also verifies signatures.
 */
export async function processDoorDashInboundOrder(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  externalEventId: string;
  payload: Record<string, unknown>;
  webhookEventId?: string;
}): Promise<DoorDashInboundResult> {
  let eventId = input.webhookEventId;

  if (!eventId) {
    const event = await createWebhookEvent({
      userId: input.userId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      provider: IntegrationProvider.DOORDASH,
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
    const normalized = normalizeDoorDashOrder(input.payload);
    const external = await persistNormalizedExternalOrder({
      userId: input.userId,
      connectionId: input.connectionId,
      normalized,
    });

    const kitchen = await importDoorDashOrderToKitchen({
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
