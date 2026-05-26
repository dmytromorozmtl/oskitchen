import type { PaymentModeKey } from "@/lib/orders/order-payment";
import { modeIsPlaceholder } from "@/lib/orders/order-payment";

export function posPaymentAllowedWhileOffline(mode: PaymentModeKey): boolean {
  if (modeIsPlaceholder(mode)) return false;
  return true;
}

export function describePosPaymentBlockReason(mode: PaymentModeKey): string {
  if (modeIsPlaceholder(mode)) {
    return "In-app or integrated card flows are disabled offline so KitchenOS never records a false paid state.";
  }
  return "";
}
