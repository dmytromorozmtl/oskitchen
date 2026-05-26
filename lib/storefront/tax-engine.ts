import type { TaxComponent, StorefrontTaxSettings } from "@/lib/storefront/tax-settings";

export type ComputedTaxLine = {
  id: string;
  label: string;
  ratePercent: number;
  amount: number;
};

export type TaxComputationInput = {
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  settings: StorefrontTaxSettings;
};

export type TaxComputationResult = {
  taxTotal: number;
  lines: ComputedTaxLine[];
  taxIncludedInPrices: boolean;
  displayLines: { key: string; label: string; amount: number }[];
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function baseForComponent(
  component: TaxComponent,
  taxableGoods: number,
  deliveryFee: number,
): number {
  if (component.appliesTo === "delivery") return deliveryFee;
  if (component.appliesTo === "all") return taxableGoods + deliveryFee;
  return taxableGoods;
}

/**
 * Computes stacked tax components (US federal+state, CA GST+PST, EU VAT, or single rate).
 * When taxIncludedInPrices is true, amounts are informational only (total does not add tax again).
 */
export function computeStorefrontTax(input: TaxComputationInput): TaxComputationResult {
  const subtotal = roundMoney(Math.max(0, input.subtotal));
  const discountAmount = roundMoney(Math.max(0, Math.min(subtotal, input.discountAmount)));
  const taxableGoods = roundMoney(Math.max(0, subtotal - discountAmount));
  const deliveryFee = roundMoney(Math.max(0, input.deliveryFee));
  const included = input.settings.taxIncludedInPrices === true;

  const lines: ComputedTaxLine[] = [];
  for (const c of input.settings.components) {
    if (c.ratePercent <= 0) continue;
    const base = baseForComponent(c, taxableGoods, deliveryFee);
    if (base <= 0) continue;
    const amount = roundMoney((base * c.ratePercent) / 100);
    if (amount <= 0) continue;
    lines.push({
      id: c.id,
      label: c.label,
      ratePercent: c.ratePercent,
      amount,
    });
  }

  const taxTotal = roundMoney(lines.reduce((s, l) => s + l.amount, 0));
  const displayLines = lines.map((l) => ({
    key: `tax_${l.id}`,
    label: l.label,
    amount: l.amount,
  }));

  return {
    taxTotal: included ? 0 : taxTotal,
    lines,
    taxIncludedInPrices: included,
    displayLines,
  };
}
