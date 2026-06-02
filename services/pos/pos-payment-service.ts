import type { PaymentModeKey } from "@/lib/orders/order-payment";
import { modeIsOfflineCardQueued, modeIsPlaceholder } from "@/lib/orders/order-payment";

export function posPaymentAllowedWhileOffline(mode: PaymentModeKey): boolean {
  if (modeIsPlaceholder(mode)) return false;
  if (modeIsOfflineCardQueued(mode)) return true;
  return true;
}

export function describePosPaymentBlockReason(mode: PaymentModeKey): string {
  if (modeIsPlaceholder(mode)) {
    return "In-app or integrated card flows are disabled offline so OS Kitchen never records a false paid state.";
  }
  if (modeIsOfflineCardQueued(mode)) {
    return "";
  }
  return "";
}
