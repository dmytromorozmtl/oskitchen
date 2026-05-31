import { IntegrationProvider } from "@prisma/client";

import { persistNormalizedExternalOrder } from "@/lib/integrations/persist-external-order";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  fetchUberEatsMarketplaceOrders,
  normalizeUberEatsMarketplaceOrder,
} from "@/services/integrations/uber-eats/uber-eats-marketplace";
import { getUberEatsCredentialsForUser } from "@/services/integrations/uber-eats/uber-eats-service";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

export async function importUberEatsOrdersForUser(userId: string): Promise<{
  imported: number;
  total: number;
}> {
  const creds = await getUberEatsCredentialsForUser(userId);
  if (!creds?.clientId?.trim() || !creds.clientSecret?.trim() || !creds.storeId?.trim()) {
    throw new Error("Uber Eats credentials are not configured.");
  }

  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.UBER_EATS,
  );
  const connection =
    (await prisma.integrationConnection.findFirst({ where })) ??
    (await prisma.integrationConnection.create({
      data: {
        userId,
        provider: IntegrationProvider.UBER_EATS,
        name: "Uber Eats",
        status: "CONNECTED",
        externalStoreId: creds.storeId,
      },
    }));

  const rawOrders = await fetchUberEatsMarketplaceOrders(creds, creds.storeId);
  let imported = 0;

  for (const raw of rawOrders) {
    const normalized = normalizeUberEatsMarketplaceOrder(raw);
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
        customerName: normalized.customer.name ?? "Uber Eats Guest",
        customerEmail: normalized.customer.email ?? `uber-eats@import.local`,
        customerPhone: normalized.customer.phone ?? null,
        fulfillmentDetail: normalized.fulfillment.type === "DELIVERY" ? "DELIVERY" : "PICKUP",
        deliveryAddressJson: normalized.fulfillment.deliveryAddress ?? undefined,
        notes: normalized.notes ?? null,
        subtotal: normalized.totals.subtotal ?? total,
        taxAmount: normalized.totals.tax ?? 0,
        feesAmount: normalized.totals.deliveryFee ?? 0,
        total,
        channelProvider: "UBER_EATS",
        externalOrderId: normalized.externalOrderId,
        sourceMetadataJson: { provider: "uber_eats", rawEvent: normalized.raw },
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
