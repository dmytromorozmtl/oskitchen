import { Prisma } from "@prisma/client";
import type {
  ExternalSyncStatus,
  FulfillmentType,
  IntegrationProvider,
} from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

function dec(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return null;
  return new Prisma.Decimal(n);
}

export async function persistNormalizedExternalOrder(input: {
  userId: string;
  connectionId: string | null;
  normalized: NormalizedKitchenOrder;
  syncStatus?: ExternalSyncStatus;
}) {
  const { userId, connectionId, normalized } = input;
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const syncStatus = input.syncStatus ?? "SYNCED";
  const payload = normalized.raw as Prisma.InputJsonValue;
  const addr = normalized.fulfillment.deliveryAddress as Prisma.InputJsonValue | undefined;

  const data = {
    userId,
    workspaceId,
    connectionId,
    provider: normalized.provider as IntegrationProvider,
    externalOrderId: normalized.externalOrderId,
    externalOrderNumber: normalized.externalOrderNumber ?? null,
    sourceStatus: normalized.sourceStatus ?? null,
    normalizedStatus: normalized.normalizedStatus,
    customerName: normalized.customer.name ?? null,
    customerEmail: normalized.customer.email ?? null,
    customerPhone: normalized.customer.phone ?? null,
    subtotal: dec(normalized.totals.subtotal),
    tax: dec(normalized.totals.tax),
    deliveryFee: dec(normalized.totals.deliveryFee),
    total: dec(normalized.totals.total),
    currency: normalized.totals.currency ?? null,
    fulfillmentType: normalized.fulfillment.type as FulfillmentType,
    pickupTime: normalized.fulfillment.pickupTime ?? null,
    deliveryTime: normalized.fulfillment.deliveryTime ?? null,
    deliveryAddressJson: addr ?? undefined,
    rawPayloadJson: payload,
    syncStatus,
  };

  if (connectionId) {
    return prisma.externalOrder.upsert({
      where: {
        connectionId_externalOrderId: {
          connectionId,
          externalOrderId: normalized.externalOrderId,
        },
      },
      create: data,
      update: {
        ...data,
      },
    });
  }

  const existing = await prisma.externalOrder.findFirst({
    where: {
      userId,
      provider: normalized.provider,
      externalOrderId: normalized.externalOrderId,
      connectionId: null,
    },
  });

  if (existing) {
    return prisma.externalOrder.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.externalOrder.create({
    data: { ...data, connectionId: null },
  });
}
