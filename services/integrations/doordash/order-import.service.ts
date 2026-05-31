import { IntegrationProvider, type Prisma } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  fetchDoorDashMarketplaceOrders,
  normalizeDoorDashOrder,
} from "@/services/integrations/doordash/doordash-marketplace";
import type { DoorDashCredentials } from "@/services/integrations/doordash/doordash-service";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

function credsFromEnv(): DoorDashCredentials {
  return {
    apiKey: process.env.DOORDASH_API_KEY ?? null,
    merchantId: process.env.DOORDASH_MERCHANT_ID ?? null,
  };
}

export async function importDoorDashOrdersForUser(userId: string): Promise<{
  imported: number;
  total: number;
}> {
  const creds = credsFromEnv();
  if (!creds.apiKey?.trim() || !creds.merchantId?.trim()) {
    throw new Error("DoorDash credentials are not configured.");
  }

  const where = await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.DOORDASH);
  const connection =
    (await prisma.integrationConnection.findFirst({ where })) ??
    (await prisma.integrationConnection.create({
      data: {
        userId,
        provider: IntegrationProvider.DOORDASH,
        name: "DoorDash",
        status: "CONNECTED",
        externalStoreId: creds.merchantId,
      },
    }));

  const rawOrders = await fetchDoorDashMarketplaceOrders(creds);
  let imported = 0;

  for (const raw of rawOrders) {
    const normalized = normalizeDoorDashOrder(raw);
    const existing = await prisma.externalOrder.findFirst({
      where: {
        connectionId: connection.id,
        externalOrderId: normalized.externalOrderId,
      },
      select: { id: true, importedOrderId: true },
    });

    if (existing?.importedOrderId) continue;

    const external = await persistNormalizedExternalOrder({
      userId,
      connectionId: connection.id,
      normalized,
    });

    const total = normalized.totals.total ?? 0;
    const order = await persistResolvedOrder(
      { userId, workspaceId: connection.workspaceId },
      {
        orderType: "SALES_CHANNEL_ORDER",
        creationSource: "CHANNEL_IMPORT",
        statusKey: "CONFIRMED",
        paymentMode: "PAY_LATER",
        customerName: normalized.customer.name ?? "DoorDash Guest",
        customerEmail: normalized.customer.email ?? `doordash@import.local`,
        customerPhone: normalized.customer.phone ?? null,
        fulfillmentDetail: normalized.fulfillment.type === "DELIVERY" ? "DELIVERY" : "PICKUP",
        deliveryAddressJson: normalized.fulfillment.deliveryAddress
          ? (normalized.fulfillment.deliveryAddress as Prisma.InputJsonValue)
          : undefined,
        notes: normalized.notes ?? null,
        subtotal: normalized.totals.subtotal ?? total,
        taxAmount: normalized.totals.tax ?? 0,
        feesAmount: normalized.totals.deliveryFee ?? 0,
        total,
        channelProvider: "DOORDASH",
        externalOrderId: normalized.externalOrderId,
        sourceMetadataJson: {
          provider: "doordash",
          rawEvent: normalized.raw,
        } as Prisma.InputJsonValue,
        lines: normalized.lineItems.map((line) => ({
          productId: null,
          title: line.title,
          sku: line.sku ?? undefined,
          quantity: line.quantity,
          unitPrice: line.unitPrice ?? 0,
          lineTotal: (line.unitPrice ?? 0) * line.quantity,
          notes: line.notes ?? undefined,
          preparedDate: null,
          modifiersJson: null,
          sourceMappingId: null,
        })),
      },
    );

    await prisma.externalOrder.update({
      where: { id: external.id },
      data: { importedOrderId: order.orderId, syncStatus: "SYNCED" },
    });
    imported += 1;
  }

  return { imported, total: rawOrders.length };
}
