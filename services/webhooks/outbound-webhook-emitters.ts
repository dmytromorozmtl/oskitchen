import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  buildInventoryUpdatedPayload,
  buildOrderCreatedPayload,
  buildOrderUpdatedPayload,
  buildReservationCreatedPayload,
  buildWaitlistJoinedPayload,
  buildWaitlistSeatedPayload,
} from "@/services/webhooks/outbound-webhook-payload-builders";
import { emitOutboundWebhookEvent } from "@/services/webhooks/outbound-webhook-delivery-service";

export async function emitOrderCreatedOutboundWebhook(input: {
  ownerUserId: string;
  workspaceId?: string | null;
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
}): Promise<void> {
  const workspaceId =
    input.workspaceId ?? (await resolveOwnerWorkspaceId(input.ownerUserId));
  emitOutboundWebhookEvent({
    ownerUserId: input.ownerUserId,
    workspaceId,
    eventType: "order.created",
    buildEnvelope: (deliveryId) =>
      buildOrderCreatedPayload({
        deliveryId,
        workspaceId,
        orderId: input.orderId,
        status: input.status,
        statusDetail: input.statusDetail,
        total: input.total,
        fulfillmentType: input.fulfillmentType,
        fulfillmentDetail: input.fulfillmentDetail,
        creationSource: input.creationSource,
        lineCount: input.lineCount,
        brandId: input.brandId,
        locationId: input.locationId,
      }),
  });
}

export async function emitOrderUpdatedOutboundWebhook(input: {
  ownerUserId: string;
  workspaceId?: string | null;
  orderId: string;
  previousStatus: string;
  status: string;
}): Promise<void> {
  const workspaceId =
    input.workspaceId ?? (await resolveOwnerWorkspaceId(input.ownerUserId));
  emitOutboundWebhookEvent({
    ownerUserId: input.ownerUserId,
    workspaceId,
    eventType: "order.updated",
    buildEnvelope: (deliveryId) =>
      buildOrderUpdatedPayload({
        deliveryId,
        workspaceId,
        orderId: input.orderId,
        previousStatus: input.previousStatus,
        status: input.status,
      }),
  });
}

export async function emitReservationCreatedOutboundWebhook(input: {
  ownerUserId: string;
  workspaceId?: string | null;
  reservationId: string;
  storefrontId: string;
  partySize: number;
  reservedAt: Date;
  status: string;
}): Promise<void> {
  const workspaceId =
    input.workspaceId ?? (await resolveOwnerWorkspaceId(input.ownerUserId));
  emitOutboundWebhookEvent({
    ownerUserId: input.ownerUserId,
    workspaceId,
    eventType: "reservation.created",
    buildEnvelope: (deliveryId) =>
      buildReservationCreatedPayload({
        deliveryId,
        workspaceId,
        reservationId: input.reservationId,
        storefrontId: input.storefrontId,
        partySize: input.partySize,
        reservedAt: input.reservedAt,
        status: input.status,
      }),
  });
}

export async function emitWaitlistJoinedOutboundWebhook(input: {
  ownerUserId: string;
  workspaceId?: string | null;
  entryId: string;
  storefrontId: string;
  partySize: number;
  position: number;
  estimatedWaitMinutes: number;
}): Promise<void> {
  const workspaceId =
    input.workspaceId ?? (await resolveOwnerWorkspaceId(input.ownerUserId));
  emitOutboundWebhookEvent({
    ownerUserId: input.ownerUserId,
    workspaceId,
    eventType: "waitlist.joined",
    buildEnvelope: (deliveryId) =>
      buildWaitlistJoinedPayload({
        deliveryId,
        workspaceId,
        entryId: input.entryId,
        storefrontId: input.storefrontId,
        partySize: input.partySize,
        position: input.position,
        estimatedWaitMinutes: input.estimatedWaitMinutes,
      }),
  });
}

export async function emitWaitlistSeatedOutboundWebhook(input: {
  ownerUserId: string;
  workspaceId?: string | null;
  entryId: string;
  storefrontId: string;
  partySize: number;
}): Promise<void> {
  const workspaceId =
    input.workspaceId ?? (await resolveOwnerWorkspaceId(input.ownerUserId));
  emitOutboundWebhookEvent({
    ownerUserId: input.ownerUserId,
    workspaceId,
    eventType: "waitlist.seated",
    buildEnvelope: (deliveryId) =>
      buildWaitlistSeatedPayload({
        deliveryId,
        workspaceId,
        entryId: input.entryId,
        storefrontId: input.storefrontId,
        partySize: input.partySize,
        status: "SEATED",
      }),
  });
}

export async function emitInventoryUpdatedOutboundWebhook(input: {
  ownerUserId: string;
  workspaceId?: string | null;
  provider: string;
  connectionId: string;
  pushed: number;
  pulled: number;
  conflictCount: number;
}): Promise<void> {
  if (input.pushed === 0 && input.pulled === 0) return;
  const workspaceId =
    input.workspaceId ?? (await resolveOwnerWorkspaceId(input.ownerUserId));
  emitOutboundWebhookEvent({
    ownerUserId: input.ownerUserId,
    workspaceId,
    eventType: "inventory.updated",
    buildEnvelope: (deliveryId) =>
      buildInventoryUpdatedPayload({
        deliveryId,
        workspaceId,
        provider: input.provider,
        connectionId: input.connectionId,
        pushed: input.pushed,
        pulled: input.pulled,
        conflictCount: input.conflictCount,
      }),
  });
}
