import { createHash, randomBytes } from "crypto";

import type {
  CateringEventType,
  CateringQuoteItem,
  CateringQuote,
  CateringQuoteLineType,
  CateringServiceStyle,
} from "@prisma/client";

/**
 * Public proposal payload — strictly allow-list of fields safe to expose
 * on a tokenised link. Anything not listed here MUST NOT leak. Internal
 * notes, costs, margins, and full CRM links are never included.
 */

export type PublicProposalLine = {
  id: string;
  lineType: CateringQuoteLineType;
  title: string;
  description: string | null;
  unit: string | null;
  quantity: number;
  total: number;
  sortOrder: number;
};

export type PublicProposalPayload = {
  brandName: string | null;
  brandLogoUrl: string | null;
  quoteNumber: string | null;
  eventName: string | null;
  eventType: CateringEventType;
  serviceStyle: CateringServiceStyle;
  eventDate: string | null;
  eventStartTime: string | null;
  eventEndTime: string | null;
  guestCount: number | null;
  customerName: string;
  companyName: string | null;
  clientNotes: string | null;
  allergyNotes: string | null;
  dietaryNotes: string | null;
  lines: PublicProposalLine[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  setupFee: number;
  staffingFee: number;
  discount: number;
  tax: number;
  total: number;
  validUntil: string | null;
  status: string;
  revoked: boolean;
};

const DEFAULT_PUBLIC_TOKEN_BYTES = 24;

export function generatePublicProposalToken(): string {
  return randomBytes(DEFAULT_PUBLIC_TOKEN_BYTES).toString("hex");
}

/**
 * Build the public-safe payload from a `CateringQuote` row. The caller
 * provides the joined relations; this function never reads them itself.
 */
export function buildPublicProposalPayload(args: {
  quote: CateringQuote;
  items: CateringQuoteItem[];
  brand?: { name: string; logoUrl: string | null } | null;
}): PublicProposalPayload {
  const revoked = !args.quote.publicToken || args.quote.publicToken.length < 8;
  const isExpired = args.quote.validUntil ? args.quote.validUntil < new Date() : false;
  return {
    brandName: args.brand?.name ?? null,
    brandLogoUrl: args.brand?.logoUrl ?? null,
    quoteNumber: args.quote.quoteNumber ?? null,
    eventName: args.quote.eventName ?? null,
    eventType: args.quote.eventType,
    serviceStyle: args.quote.serviceStyle,
    eventDate: args.quote.eventDate ? args.quote.eventDate.toISOString() : null,
    eventStartTime: args.quote.eventStartTime ? args.quote.eventStartTime.toISOString() : null,
    eventEndTime: args.quote.eventEndTime ? args.quote.eventEndTime.toISOString() : null,
    guestCount: args.quote.guestCount ?? null,
    customerName: args.quote.customerName,
    companyName: args.quote.companyName ?? null,
    clientNotes: args.quote.clientNotes ?? null,
    allergyNotes: args.quote.allergyNotes ?? null,
    dietaryNotes: args.quote.dietaryNotes ?? null,
    lines: args.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        id: item.id,
        lineType: item.lineType,
        title: item.title,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        total: Number(item.total.toString()),
        sortOrder: item.sortOrder,
      })),
    subtotal: Number(args.quote.subtotal.toString()),
    serviceFee: Number(args.quote.serviceFee.toString()),
    deliveryFee: Number(args.quote.deliveryFee.toString()),
    setupFee: Number(args.quote.setupFee.toString()),
    staffingFee: Number(args.quote.staffingFee.toString()),
    discount: Number(args.quote.discount.toString()),
    tax: Number(args.quote.tax.toString()),
    total: Number(args.quote.total.toString()),
    validUntil: args.quote.validUntil ? args.quote.validUntil.toISOString() : null,
    status: isExpired ? "EXPIRED" : args.quote.status,
    revoked,
  };
}

export function hashForProposalView(value: string | null | undefined): string | null {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function isPublicTokenValid(token: string): boolean {
  return typeof token === "string" && token.length >= 16 && /^[a-f0-9]+$/i.test(token);
}
