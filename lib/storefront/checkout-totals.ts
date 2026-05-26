import type { TaxComputationResult } from "@/lib/storefront/tax-engine";
import { computeStorefrontTax } from "@/lib/storefront/tax-engine";
import type { StorefrontTaxSettings } from "@/lib/storefront/tax-settings";

export type CheckoutLineItem = {
  key: string;
  label: string;
  amount: number;
};

export type CheckoutTotalsInput = {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  taxRatePercent?: number | null;
  taxDisplayName?: string | null;
  taxIncludedInPrices?: boolean;
  taxSettings?: StorefrontTaxSettings | null;
  tipAmount: number;
  depositAmount: number;
};

export type CheckoutTotals = {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  tax: number;
  taxDisplayName: string;
  taxBreakdown: TaxComputationResult["lines"];
  taxIncludedInPrices: boolean;
  tipAmount: number;
  depositAmount: number;
  total: number;
  lines: CheckoutLineItem[];
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Tax is computed on subtotal after discounts; delivery may be taxed per component rules.
 */
export function computeCheckoutTotals(input: CheckoutTotalsInput): CheckoutTotals {
  const subtotal = roundMoney(Math.max(0, input.subtotal));
  const discountAmount = roundMoney(Math.max(0, Math.min(subtotal, input.discountAmount)));
  const deliveryFee = roundMoney(Math.max(0, input.deliveryFee));
  const tipAmount = roundMoney(Math.max(0, input.tipAmount));
  const depositAmount = roundMoney(Math.max(0, input.depositAmount));

  let tax = 0;
  let taxDisplayName = input.taxDisplayName?.trim() || "Tax";
  let taxBreakdown: TaxComputationResult["lines"] = [];
  let taxIncludedInPrices = input.taxIncludedInPrices === true;

  if (input.taxSettings) {
    const computed = computeStorefrontTax({
      subtotal,
      discountAmount,
      deliveryFee,
      settings: input.taxSettings,
    });
    tax = computed.taxTotal;
    taxBreakdown = computed.lines;
    taxIncludedInPrices = computed.taxIncludedInPrices;
    taxDisplayName = computed.lines[0]?.label ?? taxDisplayName;
  } else {
    const taxable = roundMoney(Math.max(0, subtotal - discountAmount));
    const rate =
      input.taxRatePercent != null && input.taxRatePercent > 0 ? input.taxRatePercent : 0;
    tax = rate > 0 && !taxIncludedInPrices ? roundMoney((taxable * rate) / 100) : 0;
    if (rate > 0 && tax > 0) {
      taxBreakdown = [
        {
          id: "tax",
          label: taxDisplayName,
          ratePercent: rate,
          amount: tax,
        },
      ];
    }
  }

  const taxableBase = roundMoney(Math.max(0, subtotal - discountAmount));
  const total = roundMoney(taxableBase + tax + deliveryFee + tipAmount + depositAmount);

  const lines: CheckoutLineItem[] = [{ key: "subtotal", label: "Subtotal", amount: subtotal }];
  if (discountAmount > 0) {
    lines.push({ key: "discount", label: "Discount", amount: -discountAmount });
  }
  if (input.taxSettings && taxBreakdown.length > 0) {
    for (const t of taxBreakdown) {
      lines.push({
        key: `tax_${t.id}`,
        label: taxIncludedInPrices ? `${t.label} (included)` : t.label,
        amount: taxIncludedInPrices ? t.amount : t.amount,
      });
    }
  } else if (tax > 0) {
    lines.push({
      key: "tax",
      label: taxIncludedInPrices ? `${taxDisplayName} (included)` : taxDisplayName,
      amount: tax,
    });
  }
  if (deliveryFee > 0) {
    lines.push({ key: "delivery", label: "Delivery", amount: deliveryFee });
  }
  if (tipAmount > 0) {
    lines.push({ key: "tip", label: "Tip", amount: tipAmount });
  }
  if (depositAmount > 0) {
    lines.push({ key: "deposit", label: "Deposit", amount: depositAmount });
  }
  lines.push({ key: "total", label: "Total", amount: total });

  return {
    subtotal,
    deliveryFee,
    discountAmount,
    tax,
    taxDisplayName,
    taxBreakdown,
    taxIncludedInPrices,
    tipAmount,
    depositAmount,
    total,
    lines,
  };
}
