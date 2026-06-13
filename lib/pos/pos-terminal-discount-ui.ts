import type { PaymentModeKey } from "@/lib/orders/order-payment";
import { PAYMENT_MODE_KEYS } from "@/lib/orders/order-payment";
import { canQueueOfflineCardCapture } from "@/lib/pos/offline-pci-local-encryption";
import { validateExplicitPosDiscountAmount } from "@/lib/pos/pos-discount-guard";

export type PosTerminalDiscountMode = "none" | "fixed" | "percent";

export const POS_TERMINAL_DISCOUNT_PERCENT_PRESETS = [5, 10, 15, 20] as const;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function filterPosTerminalPaymentModes(
  canApplyPosDiscount: boolean,
  offlinePciEncryptionAvailable = canQueueOfflineCardCapture(),
): PaymentModeKey[] {
  const base = canApplyPosDiscount
    ? [...PAYMENT_MODE_KEYS]
    : PAYMENT_MODE_KEYS.filter((mode) => mode !== "COMPED");
  if (offlinePciEncryptionAvailable) return base;
  return base.filter((mode) => mode !== "OFFLINE_CARD_QUEUED");
}

export function computePosTerminalDiscountAmount(input: {
  cartSubtotal: number;
  discountMode: PosTerminalDiscountMode;
  fixedAmount: number;
  percentValue: number;
  paymentMode: PaymentModeKey | string;
}): number {
  const subtotal = Math.max(0, input.cartSubtotal);
  if (input.paymentMode === "COMPED") {
    return roundMoney(subtotal);
  }
  if (input.discountMode === "fixed") {
    const amount = Math.max(0, input.fixedAmount);
    return roundMoney(Math.min(amount, subtotal));
  }
  if (input.discountMode === "percent") {
    const pct = Math.max(0, Math.min(100, input.percentValue));
    return roundMoney(Math.min(subtotal, (subtotal * pct) / 100));
  }
  return 0;
}

export function computePosTerminalAmountDue(input: {
  cartSubtotal: number;
  discountAmount: number;
  paymentMode: PaymentModeKey | string;
}): number {
  if (input.paymentMode === "COMPED") return 0;
  return roundMoney(Math.max(0, input.cartSubtotal - input.discountAmount));
}

export function parsePosTerminalFixedDiscountInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return null;
  const validationError = validateExplicitPosDiscountAmount(parsed);
  if (validationError) return null;
  return parsed;
}

export function parsePosTerminalPercentDiscountInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return null;
  return parsed;
}
