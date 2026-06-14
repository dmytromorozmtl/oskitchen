import {
  CateringQuoteAuditEventType,
  CustomerTimelineEventType,
  type FulfillmentType,
  Prisma,
} from "@prisma/client";

import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { cateringQuoteByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { recomputeMetricsForOrderEmail } from "@/services/crm/customer-metrics-service";
import { createCateringDepositCheckoutSession } from "@/services/catering/catering-deposit-checkout-service";
import { captureErrorSafe } from "@/services/observability/error-reporting-service";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

type Scope = { userId: string };

export type ConversionPreviewLine = {
  productId: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
  lineType: string;
  warnings: string[];
};

export type ConversionPreview = {
  ok: boolean;
  customerEmail: string;
  customerName: string;
  fulfillmentType: FulfillmentType;
  pickupDate: Date | null;
  lines: ConversionPreviewLine[];
  subtotal: number;
  total: number;
  notes: string;
  warnings: string[];
  blockingErrors: string[];
};

function buildOrderNotes(args: {
  quoteNumber: string | null;
  eventName: string | null;
  eventDate: Date | null;
  guestCount: number | null;
  allergyNotes: string | null;
  dietaryNotes: string | null;
  clientNotes: string | null;
  internalNotes: string | null;
}): string {
  const lines: string[] = [];
  lines.push(`Converted from catering quote ${args.quoteNumber ?? ""}`.trim());
  if (args.eventName) lines.push(`Event: ${args.eventName}`);
  if (args.eventDate) lines.push(`Event date: ${args.eventDate.toISOString().slice(0, 10)}`);
  if (args.guestCount) lines.push(`Guests: ${args.guestCount}`);
  if (args.allergyNotes) lines.push(`Allergy: ${args.allergyNotes}`);
  if (args.dietaryNotes) lines.push(`Dietary: ${args.dietaryNotes}`);
  if (args.clientNotes) lines.push(`Client notes: ${args.clientNotes}`);
  if (args.internalNotes) lines.push(`Internal: ${args.internalNotes}`);
  return lines.filter(Boolean).join("\n");
}

export async function previewQuoteConversion(scope: Scope, quoteId: string): Promise<ConversionPreview | null> {
  const quote = await prisma.cateringQuote.findFirst({
    where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId),
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quote) return null;
  const fulfillmentType: FulfillmentType =
    quote.deliveryRequired ||
    quote.serviceStyle === "DROP_OFF" ||
    quote.serviceStyle === "BUFFET" ||
    quote.serviceStyle === "FAMILY_STYLE" ||
    quote.serviceStyle === "PLATED" ||
    quote.serviceStyle === "TRAYS" ||
    quote.serviceStyle === "BOXED_MEALS"
      ? "DELIVERY"
      : "PICKUP";

  const blockingErrors: string[] = [];
  const warnings: string[] = [];

  if (quote.status === "CONVERTED_TO_ORDER" || quote.convertedOrderId) {
    blockingErrors.push("Quote already has a converted order.");
  }
  if (quote.items.length === 0) {
    blockingErrors.push("Quote has no line items.");
  }
  const linesWithoutProduct = quote.items.filter((i) => !i.productId);
  if (linesWithoutProduct.length === quote.items.length) {
    blockingErrors.push(
      "Quote lines are not linked to products — link at least one line to a product before converting.",
    );
  } else if (linesWithoutProduct.length > 0) {
    warnings.push(`${linesWithoutProduct.length} line(s) without a linked product will not appear on the order.`);
  }
  if (!quote.allergyNotes && quote.guestCount && quote.guestCount >= 20) {
    warnings.push("No allergy notes captured for an event >= 20 guests — confirm with the client.");
  }

  const lines: ConversionPreviewLine[] = quote.items.map((i) => ({
    productId: i.productId,
    title: i.title,
    quantity: i.quantity,
    unitPrice: decimalToNumber(i.unitPrice),
    total: decimalToNumber(i.total),
    lineType: i.lineType,
    warnings: i.productId ? [] : ["No linked product — won't be added to order items."],
  }));

  return {
    ok: blockingErrors.length === 0,
    customerEmail: quote.customerEmail,
    customerName: quote.customerName,
    fulfillmentType,
    pickupDate: quote.eventDate,
    lines,
    subtotal: decimalToNumber(quote.subtotal),
    total: decimalToNumber(quote.total),
    notes: buildOrderNotes({
      quoteNumber: quote.quoteNumber,
      eventName: quote.eventName,
      eventDate: quote.eventDate,
      guestCount: quote.guestCount,
      allergyNotes: quote.allergyNotes,
      dietaryNotes: quote.dietaryNotes,
      clientNotes: quote.clientNotes,
      internalNotes: quote.internalNotes,
    }),
    warnings,
    blockingErrors,
  };
}

export type ConversionResult =
  | { ok: true; orderId: string; quoteId: string; depositUrl: string | null }
  | { ok: false; error: string };

export async function convertQuoteToOrder(
  scope: Scope,
  quoteId: string,
  performedBy?: string | null,
  depositPercent: number = 0,
): Promise<ConversionResult> {
  const preview = await previewQuoteConversion(scope, quoteId);
  if (!preview) return { ok: false, error: "Quote not found." };
  if (!preview.ok) return { ok: false, error: preview.blockingErrors.join(" ") };

  const quote = await prisma.cateringQuote.findFirst({
    where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId),
    include: { items: true },
  });
  if (!quote) return { ok: false, error: "Quote not found." };
  if (quote.status !== "ACCEPTED" && quote.status !== "READY_TO_SEND" && quote.status !== "NEEDS_REVISION") {
    if (quote.status !== "VIEWED" && quote.status !== "SENT" && quote.status !== "DRAFT") {
      return { ok: false, error: `Quote status ${quote.status} cannot be converted.` };
    }
  }

  const orderLines = quote.items
    .filter((i) => !!i.productId)
    .map((i) => ({ productId: i.productId as string, quantity: i.quantity }));
  if (orderLines.length === 0) return { ok: false, error: "No quote lines reference a product." };

  const result = await prisma.$transaction(async (tx) => {
    const order = await persistResolvedOrder(
      {
        userId: scope.userId,
        db: tx,
      },
      {
        orderType: "CATERING_ORDER",
        creationSource: "CATERING_QUOTE",
        statusKey: "DRAFT",
        paymentMode: "MANUAL_INVOICE",
        brandId: quote.brandId,
        locationId: quote.locationId,
        customerId: quote.customerId ?? undefined,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone ?? undefined,
        fulfillmentDetail:
          preview.fulfillmentType === "DELIVERY" ? "EVENT_DELIVERY" : "PICKUP",
        fulfillmentDate: preview.pickupDate ?? undefined,
        notes: preview.notes,
        subtotal: preview.subtotal,
        total: preview.total,
        lines: quote.items
          .filter((i) => !!i.productId)
          .map((i) => ({
            productId: i.productId as string,
            title: i.title,
            sku: undefined,
            quantity: i.quantity,
            unitPrice: decimalToNumber(i.unitPrice),
            lineTotal: decimalToNumber(i.total),
            notes: undefined,
            preparedDate: null,
            modifiersJson: null,
            sourceMappingId: null,
          })),
      },
    );

    await tx.cateringQuote.update({
      where: { id: quote.id },
      data: {
        status: "CONVERTED_TO_ORDER",
        convertedOrderId: order.orderId,
        acceptedAt: quote.acceptedAt ?? new Date(),
      },
    });

    await tx.cateringQuoteEvent.create({
      data: {
        quoteId: quote.id,
        eventType: CateringQuoteAuditEventType.QUOTE_CONVERTED_TO_ORDER,
        performedBy: performedBy ?? null,
        metadataJson: { orderId: order.orderId, total: preview.total } as Prisma.InputJsonValue,
      },
    });

    return order;
  });

  if (quote.customerId) {
    try {
      await prisma.customerTimelineEvent.create({
        data: {
          customerId: quote.customerId,
          eventType: CustomerTimelineEventType.OTHER,
          sourceType: "catering_quote_order",
        sourceId: result.orderId,
          summary: `Catering quote ${quote.quoteNumber ?? quote.id.slice(0, 8)} converted to draft order`,
        },
      });
    } catch (error) {
      captureErrorSafe(error, { module: "catering", action: "crm_timeline_write" });
    }
  }
  await recomputeMetricsForOrderEmail(scope.userId, quote.customerEmail);


  let depositUrl: string | null = null;
  const pct = Math.min(100, Math.max(0, depositPercent));
  if (pct > 0) {
    const depositAmount = (preview.total * pct) / 100;
    const checkout = await createCateringDepositCheckoutSession({
      orderId: result.orderId,
      quoteNumber: quote.quoteNumber,
      depositAmount,
      customerEmail: quote.customerEmail,
    });
    if (checkout.ok) {
      depositUrl = checkout.url;
      await prisma.order.update({
        where: { id: result.orderId },
        data: {
          notes: `${preview.notes}\n\nDeposit (${pct}%): ${checkout.url}`.trim(),
        },
      });
    }
  }

  return { ok: true, orderId: result.orderId, quoteId: quote.id, depositUrl };
}
