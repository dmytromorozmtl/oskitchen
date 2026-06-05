import { IntegrationProvider, type Prisma } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { prisma } from "@/lib/prisma";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

export type ShopifyKitchenImportResult = {
  imported: boolean;
  orderId?: string;
  duplicate?: boolean;
};

/** Idempotent Shopify order → kitchen order (KDS ticket) import. */
export async function importShopifyOrderToKitchen(input: {
  userId: string;
  workspaceId?: string | null;
  connectionId: string;
  normalized: NormalizedKitchenOrder;
  externalOrderRecordId: string;
}): Promise<ShopifyKitchenImportResult> {
  const existing = await prisma.externalOrder.findFirst({
    where: { id: input.externalOrderRecordId },
    select: { importedOrderId: true },
  });

  if (existing?.importedOrderId) {
    return { imported: false, duplicate: true, orderId: existing.importedOrderId };
  }

  const total = input.normalized.totals.total ?? 0;
  const order = await persistResolvedOrder(
    { userId: input.userId, workspaceId: input.workspaceId },
    {
      orderType: "SALES_CHANNEL_ORDER",
      creationSource: "CHANNEL_IMPORT",
      statusKey: "CONFIRMED",
      paymentMode: "PAY_LATER",
      customerName: input.normalized.customer.name?.trim() || "Shopify Guest",
      customerEmail: input.normalized.customer.email ?? "shopify@import.local",
      customerPhone: input.normalized.customer.phone ?? null,
      fulfillmentDetail:
        input.normalized.fulfillment.type === "DELIVERY" ? "DELIVERY" : "PICKUP",
      deliveryAddressJson: input.normalized.fulfillment.deliveryAddress
        ? (input.normalized.fulfillment.deliveryAddress as Prisma.InputJsonValue)
        : undefined,
      notes: input.normalized.notes ?? null,
      subtotal: input.normalized.totals.subtotal ?? total,
      taxAmount: input.normalized.totals.tax ?? 0,
      feesAmount: input.normalized.totals.deliveryFee ?? 0,
      total,
      channelProvider: IntegrationProvider.SHOPIFY,
      externalOrderId: input.normalized.externalOrderId,
      sourceMetadataJson: {
        provider: "shopify",
        rawEvent: input.normalized.raw,
      } as Prisma.InputJsonValue,
      lines: input.normalized.lineItems.map((line) => ({
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
    where: { id: input.externalOrderRecordId },
    data: { importedOrderId: order.orderId, syncStatus: "SYNCED" },
  });

  return { imported: true, orderId: order.orderId };
}
