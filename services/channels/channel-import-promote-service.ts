import {
  ChannelRecordValidationStatus,
  CustomerSource,
  CustomerType,
  IntegrationProvider,
  type Prisma,
} from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { normalizeProviderKey } from "@/lib/product-mapping/provider-types";
import {
  buildChannelImportChannelTrace,
  buildChannelImportSourceMetadata,
  buildKitchenOrderB2bChannelTrace,
  buildKitchenOrderB2bMetadata,
  buildKitchenOrderB2bSourceMetadata,
  incrementB2bKitchenOrderStats,
  shouldApplyKitchenOrderB2bMetadata,
} from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { extractB2bEnrichmentFromNormalized } from "@/services/integrations/shopify-b2b-order-import-enrichment-service";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";
import { upsertCustomerByEmail } from "@/services/crm/customer-service";
import { runMatch } from "@/services/product-mapping/matching-service";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { maybeRollupB2bOrderToCateringQuote } from "@/services/integrations/shopify-b2b-catering-quote-rollup-service";
import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";

const APPROVABLE_STATUSES: ChannelRecordValidationStatus[] = [
  ChannelRecordValidationStatus.VALID,
  ChannelRecordValidationStatus.WARNING,
];

export function isChannelImportRecordApprovable(status: ChannelRecordValidationStatus): boolean {
  return APPROVABLE_STATUSES.includes(status);
}

export type PromoteChannelImportResult =
  | { ok: true; orderId: string; created: boolean; b2bApplied: boolean }
  | { ok: false; error: string };

async function resolveMappedLines(
  userId: string,
  provider: IntegrationProvider,
  normalized: NormalizedKitchenOrder,
) {
  const providerKey = normalizeProviderKey(String(provider));
  const lines = [];

  for (const line of normalized.lineItems) {
    const match = await runMatch({
      userId,
      provider: providerKey,
      externalTitle: line.title,
      externalSku: line.sku ?? null,
      externalProductId: line.externalLineId ?? line.sku ?? line.title,
    });

    const unitPrice = line.unitPrice ?? 0;
    lines.push({
      productId: match.candidateId ?? null,
      title: line.title,
      sku: line.sku ?? undefined,
      quantity: line.quantity,
      unitPrice,
      lineTotal: unitPrice * line.quantity,
      notes: line.notes ?? undefined,
      preparedDate: null,
      modifiersJson: null,
      sourceMappingId: null,
    });
  }

  return lines;
}

async function linkB2bCustomer(input: {
  userId: string;
  workspaceId: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  companyName: string | null;
  companyAccountId: string | null;
  connectionId: string | null;
  orderId: string;
  orderTotal: number;
}) {
  const customer = await upsertCustomerByEmail({
    userId: input.userId,
    workspaceId: input.workspaceId,
    email: input.email,
    name: input.name,
    phone: input.phone,
    companyName: input.companyName,
    source: CustomerSource.SHOPIFY,
    sourceChannelId: input.connectionId,
    type: input.companyAccountId ? CustomerType.OFFICE_CLIENT : CustomerType.INDIVIDUAL,
    appendTimelineEvent: {
      eventType: "ORDER_PLACED",
      sourceType: "order",
      sourceId: input.orderId,
      summary: `B2B channel import — $${input.orderTotal.toFixed(2)}`,
      metadataJson: input.companyAccountId
        ? ({ companyAccountId: input.companyAccountId } as Prisma.InputJsonValue)
        : undefined,
    },
  });

  if (input.companyAccountId && customer.companyAccountId !== input.companyAccountId) {
    await prisma.kitchenCustomer.update({
      where: { id: customer.id },
      data: {
        companyAccountId: input.companyAccountId,
        type: CustomerType.OFFICE_CLIENT,
        companyName: input.companyName ?? customer.companyName,
      },
    });
    return customer.id;
  }

  return customer.id;
}

async function patchExistingOrderB2bMetadata(input: {
  orderId: string;
  sourceMetadataJson: Prisma.InputJsonValue;
  channelTraceJson: Prisma.InputJsonValue;
  customerId?: string | null;
}) {
  await prisma.order.update({
    where: { id: input.orderId },
    data: {
      sourceMetadataJson: input.sourceMetadataJson,
      channelTraceJson: input.channelTraceJson,
      ...(input.customerId ? { customerId: input.customerId } : {}),
    },
  });
}

async function recordB2bKitchenOrderStats(input: {
  connectionId: string;
  metadata: ReturnType<typeof buildKitchenOrderB2bMetadata>;
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bKitchenOrderStats(sync.b2bKitchenOrderStats, input.metadata);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bKitchenOrderStats: nextStats,
        lastB2bKitchenOrderPromoteAt: input.metadata.promotedAt,
      }) as Prisma.InputJsonValue,
    },
  });
}

function fallbackCustomerEmail(provider: IntegrationProvider, externalOrderId: string): string {
  return `${String(provider).toLowerCase()}+${externalOrderId}@channel-import.local`;
}

async function tryB2bCateringRollup(input: {
  userId: string;
  orderId: string;
  provider: IntegrationProvider;
  connectionId: string | null;
  orderTotal: number;
  b2bMetadata: KitchenOrderB2bMetadata | null;
  sourceMetadataJson: Prisma.InputJsonValue;
  normalized: NormalizedKitchenOrder;
  customerId: string | null;
}) {
  if (!input.b2bMetadata) return;
  await maybeRollupB2bOrderToCateringQuote({
    userId: input.userId,
    orderId: input.orderId,
    provider: input.provider,
    connectionId: input.connectionId,
    orderTotal: input.orderTotal,
    b2b: input.b2bMetadata,
    sourceMetadataJson: input.sourceMetadataJson,
    customerName: input.normalized.customer.name ?? input.b2bMetadata.companyName ?? "B2B guest",
    customerEmail:
      input.normalized.customer.email?.trim() ||
      fallbackCustomerEmail(input.provider, input.normalized.externalOrderId),
    customerPhone: input.normalized.customer.phone ?? null,
    customerId: input.customerId,
    fulfillmentDate: input.normalized.fulfillment.deliveryTime ?? input.normalized.fulfillment.pickupTime,
  }).catch(() => undefined);
}

export async function promoteChannelImportRecordToKitchenOrder(input: {
  userId: string;
  recordId: string;
}): Promise<PromoteChannelImportResult> {
  const record = await prisma.channelImportRecord.findFirst({
    where: { id: input.recordId, batch: { userId: input.userId } },
    include: { batch: true },
  });

  if (!record) {
    return { ok: false, error: "NOT_FOUND" };
  }
  if (!isChannelImportRecordApprovable(record.validationStatus)) {
    return { ok: false, error: "RECORD_NOT_APPROVABLE" };
  }
  if (record.importedAt) {
    return { ok: false, error: "ALREADY_IMPORTED" };
  }

  const normalized = record.normalizedJson as unknown as NormalizedKitchenOrder | null;
  if (!normalized?.lineItems?.length) {
    return { ok: false, error: "MISSING_NORMALIZED_ORDER" };
  }

  const ext = await prisma.externalOrder.findFirst({
    where: {
      userId: input.userId,
      connectionId: record.batch.connectionId ?? undefined,
      provider: record.provider,
      externalOrderId: record.externalId,
    },
  });
  if (!ext) {
    return { ok: false, error: "EXTERNAL_ORDER_NOT_FOUND" };
  }

  const enrichment = extractB2bEnrichmentFromNormalized(normalized);
  const b2bEnabled = shouldApplyKitchenOrderB2bMetadata(enrichment);
  const b2bMetadata = b2bEnabled ? buildKitchenOrderB2bMetadata(enrichment) : null;

  const workspaceId =
    ext.workspaceId ?? record.batch.workspaceId ?? (await resolveOwnerWorkspaceId(input.userId));

  const sourceMetadataJson = (
    b2bMetadata
      ? buildKitchenOrderB2bSourceMetadata({
          provider: record.provider,
          enrichment: b2bMetadata,
          externalOrderId: normalized.externalOrderId,
          externalOrderNumber: normalized.externalOrderNumber,
        })
      : buildChannelImportSourceMetadata({
          provider: record.provider,
          externalOrderId: normalized.externalOrderId,
          externalOrderNumber: normalized.externalOrderNumber,
        })
  ) as Prisma.InputJsonValue;

  const channelTraceJson = (
    b2bMetadata
      ? buildKitchenOrderB2bChannelTrace({
          provider: record.provider,
          enrichment: b2bMetadata,
          batchId: record.batchId,
          connectionId: record.batch.connectionId,
        })
      : buildChannelImportChannelTrace({
          provider: record.provider,
          batchId: record.batchId,
          connectionId: record.batch.connectionId,
        })
  ) as Prisma.InputJsonValue;

  if (ext.importedOrderId) {
    let customerId: string | null = null;
    if (b2bMetadata?.companyAccountId) {
      const email =
        normalized.customer.email?.trim() ||
        fallbackCustomerEmail(record.provider, normalized.externalOrderId);
      customerId = await linkB2bCustomer({
        userId: input.userId,
        workspaceId,
        email,
        name: normalized.customer.name ?? b2bMetadata.companyName,
        phone: normalized.customer.phone ?? null,
        companyName: b2bMetadata.companyName,
        companyAccountId: b2bMetadata.companyAccountId,
        connectionId: record.batch.connectionId,
        orderId: ext.importedOrderId,
        orderTotal: normalized.totals.total ?? 0,
      });
    }

    await patchExistingOrderB2bMetadata({
      orderId: ext.importedOrderId,
      sourceMetadataJson,
      channelTraceJson,
      customerId,
    });

    if (b2bMetadata && record.batch.connectionId) {
      await recordB2bKitchenOrderStats({
        connectionId: record.batch.connectionId,
        metadata: b2bMetadata,
      });
    }

    await tryB2bCateringRollup({
      userId: input.userId,
      orderId: ext.importedOrderId,
      provider: record.provider,
      connectionId: record.batch.connectionId,
      orderTotal: normalized.totals.total ?? 0,
      b2bMetadata,
      sourceMetadataJson,
      normalized,
      customerId,
    });

    return {
      ok: true,
      orderId: ext.importedOrderId,
      created: false,
      b2bApplied: Boolean(b2bMetadata),
    };
  }

  const lines = await resolveMappedLines(input.userId, record.provider, normalized);
  const total = normalized.totals.total ?? 0;
  const email =
    normalized.customer.email?.trim() ||
    fallbackCustomerEmail(record.provider, normalized.externalOrderId);

  let customerId: string | null = null;
  if (b2bMetadata?.companyAccountId) {
    customerId = await linkB2bCustomer({
      userId: input.userId,
      workspaceId,
      email,
      name: normalized.customer.name ?? b2bMetadata.companyName,
      phone: normalized.customer.phone ?? null,
      companyName: b2bMetadata.companyName,
      companyAccountId: b2bMetadata.companyAccountId,
      connectionId: record.batch.connectionId,
      orderId: "pending",
      orderTotal: total,
    });
  }

  const order = await persistResolvedOrder(
    { userId: input.userId, workspaceId },
    {
      orderType: "SALES_CHANNEL_ORDER",
      creationSource: "CHANNEL_IMPORT",
      statusKey: "CONFIRMED",
      paymentMode: "PAY_LATER",
      customerId: customerId ?? undefined,
      customerName: normalized.customer.name ?? b2bMetadata?.companyName ?? "Channel guest",
      customerEmail: email,
      customerPhone: normalized.customer.phone ?? null,
      fulfillmentDetail: normalized.fulfillment.type === "DELIVERY" ? "DELIVERY" : "PICKUP",
      deliveryAddressJson: normalized.fulfillment.deliveryAddress ?? undefined,
      notes: normalized.notes ?? undefined,
      subtotal: normalized.totals.subtotal ?? total,
      taxAmount: normalized.totals.tax ?? 0,
      feesAmount: normalized.totals.deliveryFee ?? 0,
      total,
      channelProvider: String(record.provider),
      externalOrderId: normalized.externalOrderId,
      sourceMetadataJson,
      channelTraceJson,
      channelImportBatchId: record.batchId,
      lines,
    },
  );

  await prisma.externalOrder.update({
    where: { id: ext.id },
    data: { importedOrderId: order.orderId, syncStatus: "SYNCED" },
  });

  if (b2bMetadata && record.batch.connectionId) {
    await recordB2bKitchenOrderStats({
      connectionId: record.batch.connectionId,
      metadata: b2bMetadata,
    });
  }

  await tryB2bCateringRollup({
    userId: input.userId,
    orderId: order.orderId,
    provider: record.provider,
    connectionId: record.batch.connectionId,
    orderTotal: total,
    b2bMetadata,
    sourceMetadataJson,
    normalized,
    customerId,
  });

  return {
    ok: true,
    orderId: order.orderId,
    created: true,
    b2bApplied: Boolean(b2bMetadata),
  };
}
