import type { PaymentModeKey } from "@/lib/orders/order-payment";
import { PAYMENT_MODE_KEYS, PAYMENT_MODE_LABEL } from "@/lib/orders/order-payment";

export type PosPaymentModeKey = PaymentModeKey;

export const POS_PAYMENT_MODE_KEYS = PAYMENT_MODE_KEYS;
export const POS_PAYMENT_MODE_LABEL = PAYMENT_MODE_LABEL;

/** Spec / roadmap aliases mapped to real `PaymentModeKey` values. */
export const POS_PAYMENT_MODE_ALIASES: Record<string, PaymentModeKey> = {
  EXTERNAL_CARD_TERMINAL: "CARD_TERMINAL_PLACEHOLDER",
  STRIPE_TERMINAL_PLACEHOLDER: "STRIPE_PLACEHOLDER",
  GIFT_CARD_PLACEHOLDER: "PAY_LATER",
  MEAL_PLAN_REDEMPTION_PLACEHOLDER: "PAY_LATER",
  SPLIT_PAYMENT_PLACEHOLDER: "PAY_LATER",
};
