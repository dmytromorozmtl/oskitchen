import type { PaymentModeKey } from "@/lib/orders/order-payment";

/** Canonical permission for explicit POS discounts and COMPED checkout. */
export const POS_DISCOUNT_APPLY_PERMISSION = "pos.discount.apply" as const;

export type PosDiscountGuardInput = {
  paymentMode: PaymentModeKey | string;
  discountAmount?: number;
};

export type PosDiscountGuardReason =
  | "no_discount_or_comp"
  | "explicit_discount"
  | "comped_payment_mode";

export type PosDiscountGuardResult =
  | {
      requiresManagerDiscount: false;
      reason: "no_discount_or_comp";
      explicitDiscountAmount: number;
      paymentMode: string;
    }
  | {
      requiresManagerDiscount: true;
      reason: "explicit_discount" | "comped_payment_mode";
      explicitDiscountAmount: number;
      paymentMode: string;
    };

export type PosDiscountAuditMetadata = {
  paymentMode: string;
  explicitDiscountAmount: number;
  guardReason: PosDiscountGuardReason;
};

/**
 * Gift card and loyalty redemption stack at the service layer and do not require
 * `pos.discount.apply` at the action gate — only explicit discount amounts and COMPED mode do.
 */
export const POS_DISCOUNT_ACTION_GATE_EXCLUSIONS = [
  "gift_card_redemption",
  "loyalty_points_redemption",
] as const;

export function resolvePosDiscountGuard(input: PosDiscountGuardInput): PosDiscountGuardResult {
  const explicitDiscountAmount = input.discountAmount ?? 0;
  const paymentMode = String(input.paymentMode);

  if (explicitDiscountAmount > 0) {
    return {
      requiresManagerDiscount: true,
      reason: "explicit_discount",
      explicitDiscountAmount,
      paymentMode,
    };
  }

  if (paymentMode === "COMPED") {
    return {
      requiresManagerDiscount: true,
      reason: "comped_payment_mode",
      explicitDiscountAmount,
      paymentMode,
    };
  }

  return {
    requiresManagerDiscount: false,
    reason: "no_discount_or_comp",
    explicitDiscountAmount,
    paymentMode,
  };
}

export function buildPosDiscountAuditMetadata(
  guard: PosDiscountGuardResult,
): PosDiscountAuditMetadata {
  return {
    paymentMode: guard.paymentMode,
    explicitDiscountAmount: guard.explicitDiscountAmount,
    guardReason: guard.reason,
  };
}

export function validateExplicitPosDiscountAmount(amount: number | undefined): string | null {
  if (amount == null) return null;
  if (!Number.isFinite(amount)) return "Discount amount must be a valid number.";
  if (amount < 0) return "Discount amount cannot be negative.";
  if (amount > 10_000_000) return "Discount amount exceeds allowed maximum.";
  return null;
}

export type PosCheckoutDiscountStackInput = {
  explicitDiscountAmount?: number;
  giftCardApplied?: number;
  loyaltyDiscountApplied?: number;
};

/** Sum explicit, gift-card, and loyalty discounts for order creation (service layer). */
export function computePosCheckoutDiscountTotal(
  input: PosCheckoutDiscountStackInput,
): number {
  const explicit = input.explicitDiscountAmount ?? 0;
  const giftCard = input.giftCardApplied ?? 0;
  const loyalty = input.loyaltyDiscountApplied ?? 0;
  return explicit + giftCard + loyalty;
}
