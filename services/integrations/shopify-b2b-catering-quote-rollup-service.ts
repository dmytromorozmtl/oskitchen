import {
  CateringQuoteAuditEventType,
  IntegrationProvider,
  type Prisma,
} from "@prisma/client";

import {
  isShopifyMarketsB2bCateringRollupEnabled,
  resolveB2bCateringRollupMinTotal,
  DEFAULT_B2B_CATERING_ROLLUP_MIN_TOTAL,
} from "@/lib/commercial/shopify-market-b2b-catering-rollup";
import {
  appendCateringQuoteRollupToB2bMetadata,
  buildB2bRollupMarker,
  incrementB2bCateringRollupStats,
  isoWeekKey,
  readB2bCateringQuoteRollupLink,
  type B2bCateringQuoteRollupLink,
} from "@/lib/integrations/shopify-b2b-catering-rollup-metadata";
import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { cateringQuoteListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { addQuoteLine, createQuote } from "@/services/catering/quote-service";

export type B2bCateringRollupResult =
  | { ok: true; linked: B2bCateringQuoteRollupLink }
  | { ok: false; reason: string; skipped?: boolean };

async function recordRollupStats(input: {
  connectionId: string;
  patch: Parameters<typeof incrementB2bCateringRollupStats>[1];
  rolledAt: string;
}) {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bCateringRollupStats(sync.b2bCateringRollupStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bCateringRollupStats: nextStats,
        lastB2bCateringRollupAt: input.rolledAt,
      }) as Prisma.InputJsonValue,
    },
  });
}

async function patchOrderRollupLink(input: {
  orderId: string;
  sourceMetadataJson: unknown;
  b2b: KitchenOrderB2bMetadata;
  link: B2bCateringQuoteRollupLink;
}) {
  const root =
    input.sourceMetadataJson && typeof input.sourceMetadataJson === "object"
      ? { ...(input.sourceMetadataJson as Record<string, unknown>) }
      : {};
  root.b2b = appendCateringQuoteRollupToB2bMetadata(input.b2b, input.link);
  await prisma.order.update({
    where: { id: input.orderId },
    data: { sourceMetadataJson: root as Prisma.InputJsonValue },
  });
}

export async function maybeRollupB2bOrderToCateringQuote(input: {
  userId: string;
  orderId: string;
  provider: IntegrationProvider;
  connectionId: string | null;
  orderTotal: number;
  b2b: KitchenOrderB2bMetadata;
  sourceMetadataJson: unknown;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerId?: string | null;
  fulfillmentDate?: Date | null;
}): Promise<B2bCateringRollupResult> {
  if (!isShopifyMarketsB2bCateringRollupEnabled()) {
    return { ok: false, reason: "rollup_disabled", skipped: true };
  }
  if (input.provider !== IntegrationProvider.SHOPIFY) {
    return { ok: false, reason: "not_shopify", skipped: true };
  }
  if (input.b2b.status !== "complete" || !input.b2b.companyAccountId) {
    if (input.connectionId) {
      await recordRollupStats({
        connectionId: input.connectionId,
        patch: { skippedIncomplete: 1 },
        rolledAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "b2b_incomplete", skipped: true };
  }

  const existingLink = readB2bCateringQuoteRollupLink(input.sourceMetadataJson);
  if (existingLink) {
    if (input.connectionId) {
      await recordRollupStats({
        connectionId: input.connectionId,
        patch: { skippedAlreadyLinked: 1 },
        rolledAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "already_linked", skipped: true };
  }

  let minTotal = DEFAULT_B2B_CATERING_ROLLUP_MIN_TOTAL;
  if (input.connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: input.connectionId },
      select: { settingsJson: true },
    });
    const sync = parseShopifyMarketsSyncSettings(conn?.settingsJson);
    minTotal = resolveB2bCateringRollupMinTotal(sync.b2bCateringRollupMinTotal);
  }

  if (input.orderTotal < minTotal) {
    if (input.connectionId) {
      await recordRollupStats({
        connectionId: input.connectionId,
        patch: { skippedBelowThreshold: 1 },
        rolledAt: new Date().toISOString(),
      });
    }
    return { ok: false, reason: "below_threshold", skipped: true };
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: input.orderId },
    select: {
      id: true,
      title: true,
      quantity: true,
      unitPrice: true,
      productId: true,
      notes: true,
    },
    orderBy: { id: "asc" },
  });
  if (!orderItems.length) {
    return { ok: false, reason: "no_order_lines" };
  }

  const rolledAt = new Date().toISOString();
  const fulfillmentWeekKey = isoWeekKey(input.fulfillmentDate ?? new Date());
  const marker = buildB2bRollupMarker({
    fulfillmentWeekKey,
    companyAccountId: input.b2b.companyAccountId,
  });

  const quoteScope = await cateringQuoteListWhereForOwner(input.userId);
  let quote = await prisma.cateringQuote.findFirst({
    where: {
      AND: [
        quoteScope,
        {
          companyAccountId: input.b2b.companyAccountId,
          status: "DRAFT",
          internalNotes: { contains: marker },
        },
      ],
    },
    select: { id: true, quoteNumber: true, internalNotes: true },
  });

  let action: B2bCateringQuoteRollupLink["action"] = "appended";
  if (!quote) {
    action = "created";
    const created = await createQuote({
      userId: input.userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone ?? null,
      companyName: input.b2b.companyName,
      customerId: input.customerId ?? null,
      companyAccountId: input.b2b.companyAccountId,
      eventName: `B2B rollup · ${input.b2b.companyName ?? "Company"} · ${fulfillmentWeekKey}`,
      eventType: "OFFICE_EVENT",
      serviceStyle: "DROP_OFF",
      eventDate: input.fulfillmentDate ?? null,
      deliveryRequired: false,
      internalNotes: `${marker}\nSource orders: ${input.orderId}`,
      notes: `Auto-generated from Shopify B2B channel import (${fulfillmentWeekKey}). Review before sending to client.`,
      performedBy: "shopify-b2b-rollup",
    });
    quote = {
      id: created.id,
      quoteNumber: created.quoteNumber,
      internalNotes: created.internalNotes,
    };
  } else {
    const notes = [quote.internalNotes ?? "", `Source orders: +${input.orderId}`]
      .filter(Boolean)
      .join("\n");
    await prisma.cateringQuote.update({
      where: { id: quote.id },
      data: { internalNotes: notes },
    });
  }

  for (const item of orderItems) {
    await addQuoteLine(
      { userId: input.userId },
      quote.id,
      {
        title: item.title,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        notes: item.notes
          ? `${item.notes} · order ${input.orderId.slice(0, 8)}`
          : `From order ${input.orderId.slice(0, 8)}`,
        lineType: "FOOD",
      },
      "shopify-b2b-rollup",
    );
  }

  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.OTHER,
      performedBy: "shopify-b2b-rollup",
      metadataJson: {
        b2bRollup: true,
        orderId: input.orderId,
        action,
        fulfillmentWeekKey,
        lineCount: orderItems.length,
        companyAccountId: input.b2b.companyAccountId,
        osMarketId: input.b2b.osMarketId,
      } as Prisma.InputJsonValue,
    },
  });

  const link: B2bCateringQuoteRollupLink = {
    quoteId: quote.id,
    quoteNumber: quote.quoteNumber,
    action,
    rolledAt,
    fulfillmentWeekKey,
    lineCount: orderItems.length,
  };

  await patchOrderRollupLink({
    orderId: input.orderId,
    sourceMetadataJson: input.sourceMetadataJson,
    b2b: input.b2b,
    link,
  });

  if (input.connectionId) {
    await recordRollupStats({
      connectionId: input.connectionId,
      patch: {
        quotesCreated: action === "created" ? 1 : 0,
        ordersAppended: action === "appended" ? 1 : 0,
        linesRolled: orderItems.length,
      },
      rolledAt,
    });
  }

  return { ok: true, linked: link };
}
