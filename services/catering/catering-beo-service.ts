import { buildCateringBeoFromQuote } from "@/lib/catering/catering-beo-p2-64-builder";
import type { BeoQuoteInput, CateringBeoDocument } from "@/lib/catering/catering-beo-p2-64-types";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { cateringQuoteByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

type Scope = { userId: string };

async function loadQuote(scope: Scope, quoteId: string) {
  return prisma.cateringQuote.findFirst({
    where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId),
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      brand: { select: { name: true } },
      location: { select: { name: true } },
    },
  });
}

type LoadedQuote = NonNullable<Awaited<ReturnType<typeof loadQuote>>>;

function mapQuoteToBeoInput(quote: LoadedQuote): BeoQuoteInput {
  return {
    quoteNumber: quote.quoteNumber,
    eventName: quote.eventName,
    customerName: quote.customerName,
    companyName: quote.companyName,
    customerEmail: quote.customerEmail,
    customerPhone: quote.customerPhone,
    eventDate: quote.eventDate,
    eventStartTime: quote.eventStartTime,
    eventEndTime: quote.eventEndTime,
    guestCount: quote.guestCount,
    eventType: quote.eventType,
    serviceStyle: quote.serviceStyle,
    deliveryRequired: quote.deliveryRequired,
    setupRequired: quote.setupRequired,
    staffingRequired: quote.staffingRequired,
    dietaryNotes: quote.dietaryNotes,
    allergyNotes: quote.allergyNotes,
    clientNotes: quote.clientNotes,
    internalNotes: quote.internalNotes,
    eventAddressJson:
      quote.eventAddressJson && typeof quote.eventAddressJson === "object"
        ? (quote.eventAddressJson as Record<string, unknown>)
        : null,
    items: quote.items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice),
      lineType: item.lineType,
      notes: item.notes,
    })),
    locationName: quote.location?.name ?? null,
    brandName: quote.brand?.name ?? null,
  };
}

export async function buildCateringBeoForQuote(
  scope: Scope,
  quoteId: string,
): Promise<CateringBeoDocument | null> {
  const quote = await loadQuote(scope, quoteId);
  if (!quote) return null;
  return buildCateringBeoFromQuote(mapQuoteToBeoInput(quote));
}

export { buildCateringBeoFromQuote };
