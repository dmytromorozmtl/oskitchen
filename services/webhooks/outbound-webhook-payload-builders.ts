import type { OutboundWebhookEventType } from "@/lib/webhooks/outbound-webhook-events";

export type OutboundWebhookEnvelope = {
  id: string;
  type: OutboundWebhookEventType;
  createdAt: string;
  workspaceId: string | null;
  data: Record<string, unknown>;
};

export function buildOrderCreatedPayload(input: {
  deliveryId: string;
  workspaceId: string | null;
  orderId: string;
  status: string;
  statusDetail?: string | null;
  total: number;
  fulfillmentType: string;
  fulfillmentDetail?: string | null;
  creationSource?: string | null;
  lineCount: number;
  brandId?: string | null;
  locationId?: string | null;
}): OutboundWebhookEnvelope {
  return {
    id: input.deliveryId,
    type: "order.created",
    createdAt: new Date().toISOString(),
    workspaceId: input.workspaceId,
    data: {
      orderId: input.orderId,
      status: input.status,
      statusDetail: input.statusDetail ?? null,
      total: input.total,
      fulfillmentType: input.fulfillmentType,
      fulfillmentDetail: input.fulfillmentDetail ?? null,
      creationSource: input.creationSource ?? null,
      lineCount: input.lineCount,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
    },
  };
}

export function buildOrderUpdatedPayload(input: {
  deliveryId: string;
  workspaceId: string | null;
  orderId: string;
  previousStatus: string;
  status: string;
  updatedAt?: Date;
}): OutboundWebhookEnvelope {
  return {
    id: input.deliveryId,
    type: "order.updated",
    createdAt: new Date().toISOString(),
    workspaceId: input.workspaceId,
    data: {
      orderId: input.orderId,
      previousStatus: input.previousStatus,
      status: input.status,
      updatedAt: (input.updatedAt ?? new Date()).toISOString(),
    },
  };
}

export function buildReservationCreatedPayload(input: {
  deliveryId: string;
  workspaceId: string | null;
  reservationId: string;
  storefrontId: string;
  partySize: number;
  reservedAt: Date;
  status: string;
}): OutboundWebhookEnvelope {
  return {
    id: input.deliveryId,
    type: "reservation.created",
    createdAt: new Date().toISOString(),
    workspaceId: input.workspaceId,
    data: {
      reservationId: input.reservationId,
      storefrontId: input.storefrontId,
      partySize: input.partySize,
      reservedAt: input.reservedAt.toISOString(),
      status: input.status,
    },
  };
}

export function buildWaitlistJoinedPayload(input: {
  deliveryId: string;
  workspaceId: string | null;
  entryId: string;
  storefrontId: string;
  partySize: number;
  position: number;
  estimatedWaitMinutes: number;
}): OutboundWebhookEnvelope {
  return {
    id: input.deliveryId,
    type: "waitlist.joined",
    createdAt: new Date().toISOString(),
    workspaceId: input.workspaceId,
    data: {
      entryId: input.entryId,
      storefrontId: input.storefrontId,
      partySize: input.partySize,
      position: input.position,
      estimatedWaitMinutes: input.estimatedWaitMinutes,
    },
  };
}

export function buildWaitlistSeatedPayload(input: {
  deliveryId: string;
  workspaceId: string | null;
  entryId: string;
  storefrontId: string;
  partySize: number;
  status: string;
}): OutboundWebhookEnvelope {
  return {
    id: input.deliveryId,
    type: "waitlist.seated",
    createdAt: new Date().toISOString(),
    workspaceId: input.workspaceId,
    data: {
      entryId: input.entryId,
      storefrontId: input.storefrontId,
      partySize: input.partySize,
      status: input.status,
    },
  };
}

export function buildInventoryUpdatedPayload(input: {
  deliveryId: string;
  workspaceId: string | null;
  provider: string;
  connectionId: string;
  pushed: number;
  pulled: number;
  conflictCount: number;
}): OutboundWebhookEnvelope {
  return {
    id: input.deliveryId,
    type: "inventory.updated",
    createdAt: new Date().toISOString(),
    workspaceId: input.workspaceId,
    data: {
      provider: input.provider,
      connectionId: input.connectionId,
      pushed: input.pushed,
      pulled: input.pulled,
      conflictCount: input.conflictCount,
    },
  };
}

export function serializeOutboundWebhookEnvelope(envelope: OutboundWebhookEnvelope): string {
  return JSON.stringify(envelope);
}
