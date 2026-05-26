import type { Prisma } from "@prisma/client";

/**
 * Pure pricing helpers — no Prisma queries. Inputs are plain numbers; the
 * caller converts Decimal ↔ number at the edges.
 */

export type QuoteLineForCalculation = {
  quantity: number;
  unitPrice: number;
  costEstimate?: number | null;
};

export type QuoteFeesForCalculation = {
  serviceFee?: number | null;
  deliveryFee?: number | null;
  setupFee?: number | null;
  staffingFee?: number | null;
  discount?: number | null;
  tax?: number | null;
};

export type QuoteTotalsResult = {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  setupFee: number;
  staffingFee: number;
  discount: number;
  tax: number;
  total: number;
  totalCost: number | null;
  totalMargin: number | null;
  marginPct: number | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeQuoteTotals(
  lines: QuoteLineForCalculation[],
  fees: QuoteFeesForCalculation,
): QuoteTotalsResult {
  let subtotal = 0;
  let totalCost: number | null = null;
  for (const line of lines) {
    const lineTotal = line.quantity * line.unitPrice;
    subtotal += lineTotal;
    if (line.costEstimate != null) {
      totalCost = (totalCost ?? 0) + line.costEstimate * line.quantity;
    }
  }
  subtotal = round2(subtotal);
  const serviceFee = round2(fees.serviceFee ?? 0);
  const deliveryFee = round2(fees.deliveryFee ?? 0);
  const setupFee = round2(fees.setupFee ?? 0);
  const staffingFee = round2(fees.staffingFee ?? 0);
  const discount = round2(fees.discount ?? 0);
  const tax = round2(fees.tax ?? 0);

  const total = round2(subtotal + serviceFee + deliveryFee + setupFee + staffingFee + tax - discount);
  const totalMargin = totalCost != null ? round2(total - totalCost) : null;
  const marginPct = totalCost != null && total > 0 ? round2((totalMargin! / total) * 100) : null;

  return {
    subtotal,
    serviceFee,
    deliveryFee,
    setupFee,
    staffingFee,
    discount,
    tax,
    total,
    totalCost: totalCost != null ? round2(totalCost) : null,
    totalMargin,
    marginPct,
  };
}

export function perPersonPrice(total: number, guestCount: number | null | undefined): number | null {
  if (!guestCount || guestCount <= 0) return null;
  return round2(total / guestCount);
}

/** Convert a Prisma.Decimal (or string) to a number safely. */
export function decimalToNumber(value: Prisma.Decimal | string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return Number(value.toString()) || 0;
}
