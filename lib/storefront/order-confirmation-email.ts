import type { ComputedTaxLine } from "@/lib/storefront/tax-engine";
import { formatCurrency } from "@/lib/utils";

export type OrderConfirmationCommerceParams = {
  marketLabel?: string | null;
  subtotal?: string | null;
  discount?: string | null;
  deliveryFee?: string | null;
  taxLines?: { label: string; amount: string }[];
  taxIncludedNote?: string | null;
};

export function buildOrderConfirmationCommerce(input: {
  marketName: string | null;
  marketId: string | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxBreakdown: ComputedTaxLine[];
  taxTotal: number;
  taxIncludedInPrices?: boolean;
  currency?: string;
}): OrderConfirmationCommerceParams {
  const marketLabel =
    input.marketName?.trim() ||
    (input.marketId?.trim() ? `Market ${input.marketId}` : null);

  const taxLines =
    input.taxBreakdown.length > 0
      ? input.taxBreakdown.map((t) => ({
          label: input.taxIncludedInPrices ? `${t.label} (included)` : t.label,
          amount: formatCurrency(t.amount),
        }))
      : input.taxTotal > 0
        ? [{ label: "Tax", amount: formatCurrency(input.taxTotal) }]
        : [];

  return {
    marketLabel,
    subtotal: formatCurrency(input.subtotal),
    discount: input.discount > 0 ? formatCurrency(-input.discount) : null,
    deliveryFee: input.deliveryFee > 0 ? formatCurrency(input.deliveryFee) : null,
    taxLines: taxLines.length > 0 ? taxLines : undefined,
    taxIncludedNote: input.taxIncludedInPrices
      ? "Prices include tax where noted."
      : null,
  };
}

export function orderConfirmationTotalsHtml(
  commerce: OrderConfirmationCommerceParams,
): string {
  const rows: string[] = [];
  if (commerce.marketLabel) {
    rows.push(
      `<tr><td colspan="2" style="padding:8px 0;font-size:13px;color:#64748b;"><strong>Market:</strong> ${escape(commerce.marketLabel)}</td></tr>`,
    );
  }
  if (commerce.subtotal) {
    rows.push(row("Subtotal", commerce.subtotal));
  }
  if (commerce.discount) {
    rows.push(row("Discount", commerce.discount));
  }
  for (const t of commerce.taxLines ?? []) {
    rows.push(row(t.label, t.amount));
  }
  if (commerce.deliveryFee) {
    rows.push(row("Delivery", commerce.deliveryFee));
  }
  if (commerce.taxIncludedNote) {
    rows.push(
      `<tr><td colspan="2" style="padding:4px 0;font-size:12px;color:#94a3b8;">${escape(commerce.taxIncludedNote)}</td></tr>`,
    );
  }
  if (rows.length === 0) return "";
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">
      <tbody>${rows.join("")}</tbody>
    </table>`;
}

function row(label: string, amount: string) {
  return `<tr>
    <td style="padding:6px 0;color:#64748b;">${escape(label)}</td>
    <td style="padding:6px 0;text-align:right;font-weight:500;">${escape(amount)}</td>
  </tr>`;
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
