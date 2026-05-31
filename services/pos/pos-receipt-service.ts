import type { PaymentModeKey } from "@/lib/orders/order-payment";

export function buildPosReceiptText(input: {
  receiptNumber: string;
  businessName: string | null;
  orderId: string;
  /** When the sale is linked to a CRM profile, printed for staff / guest copy. */
  customerSummary?: string | null;
  lines: { title: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMode: PaymentModeKey;
  fulfillment: string;
}): string {
  const header = input.businessName ?? "OS Kitchen";
  const lines = input.lines
    .map((l) => `${l.quantity}× ${l.title} @ ${l.unitPrice.toFixed(2)} = ${l.lineTotal.toFixed(2)}`)
    .join("\n");
  const customerLine =
    input.customerSummary && input.customerSummary.trim().length > 0
      ? [`Customer: ${input.customerSummary.trim()}`]
      : [];
  return [
    header,
    `Receipt: ${input.receiptNumber}`,
    `Order: ${input.orderId}`,
    ...customerLine,
    `Fulfillment: ${input.fulfillment}`,
    `Payment: ${input.paymentMode}`,
    "—",
    lines,
    "—",
    `Subtotal: ${input.subtotal.toFixed(2)}`,
    `Tax: ${input.tax.toFixed(2)}`,
    `Discount: ${input.discount.toFixed(2)}`,
    `Total: ${input.total.toFixed(2)}`,
    "",
    "Thank you — items prepared according to your kitchen workflow.",
  ].join("\n");
}
