export const PAYMENT_MODE_KEYS = [
  "PAY_LATER",
  "REQUEST_ONLY",
  "PAID_EXTERNALLY",
  "MANUAL_INVOICE",
  "STRIPE_PLACEHOLDER",
  "CASH",
  "CARD_TERMINAL_PLACEHOLDER",
  "COMPED",
] as const;
export type PaymentModeKey = (typeof PAYMENT_MODE_KEYS)[number];

export const PAYMENT_MODE_LABEL: Record<PaymentModeKey, string> = {
  PAY_LATER: "Pay later",
  REQUEST_ONLY: "Request only (no payment)",
  PAID_EXTERNALLY: "Paid externally",
  MANUAL_INVOICE: "Manual invoice",
  STRIPE_PLACEHOLDER: "Stripe checkout (when configured)",
  CASH: "Cash",
  CARD_TERMINAL_PLACEHOLDER: "Card terminal (mark paid after external approval)",
  COMPED: "Comped (manager approval required in POS)",
};

export const PAYMENT_STATUS_KEYS = [
  "UNPAID",
  "PARTIAL",
  "PAID",
  "REFUNDED",
  "VOIDED",
  "NOT_REQUIRED",
  "PENDING",
] as const;
export type PaymentStatusKey = (typeof PAYMENT_STATUS_KEYS)[number];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatusKey, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  PAID: "Paid",
  REFUNDED: "Refunded",
  VOIDED: "Voided",
  NOT_REQUIRED: "Not required",
  PENDING: "Pending",
};

/** Modes that *never* trigger any in-app payment side effects. */
export function modeIsPaymentless(m: PaymentModeKey): boolean {
  return m === "REQUEST_ONLY" || m === "PAY_LATER" || m === "PAID_EXTERNALLY" || m === "MANUAL_INVOICE" || m === "COMPED";
}

/** Modes reserved for future Stripe / terminal flows. We do not fake payment success here. */
export function modeIsPlaceholder(m: PaymentModeKey): boolean {
  return m === "STRIPE_PLACEHOLDER" || m === "CARD_TERMINAL_PLACEHOLDER";
}

/**
 * Initial `Order.paymentStatus` when an order is first persisted.
 * Never `PAID` for Stripe/terminal placeholder modes until a real capture integration exists.
 */
export function initialOrderPaymentStatusFromMode(mode: PaymentModeKey): PaymentStatusKey {
  if (mode === "CASH" || mode === "PAID_EXTERNALLY" || mode === "COMPED") return "PAID";
  if (modeIsPlaceholder(mode)) return "PENDING";
  if (mode === "REQUEST_ONLY") return "NOT_REQUIRED";
  return "UNPAID";
}
