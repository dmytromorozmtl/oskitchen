import type { PaymentModeKey } from "@/lib/orders/order-payment";
import { modeIsOfflineCardQueued, modeIsPlaceholder } from "@/lib/orders/order-payment";

export type PosOfflinePaymentGateOptions = {
  /** When false, OFFLINE_CARD_QUEUED is blocked (requires Web Crypto + IndexedDB). */
  offlinePciEncryptionAvailable?: boolean;
};

export function posPaymentAllowedWhileOffline(
  mode: PaymentModeKey,
  options?: PosOfflinePaymentGateOptions,
): boolean {
  if (modeIsPlaceholder(mode)) return false;
  if (modeIsOfflineCardQueued(mode)) {
    return options?.offlinePciEncryptionAvailable === true;
  }
  return true;
}

export function describePosPaymentBlockReason(
  mode: PaymentModeKey,
  options?: PosOfflinePaymentGateOptions,
): string {
  if (modeIsPlaceholder(mode)) {
    return "In-app or integrated card flows are disabled offline so OS Kitchen never records a false paid state.";
  }
  if (modeIsOfflineCardQueued(mode) && options?.offlinePciEncryptionAvailable !== true) {
    return "Offline card queue requires Web Crypto and IndexedDB on this device — use cash offline or reconnect for card.";
  }
  if (modeIsOfflineCardQueued(mode)) {
    return "";
  }
  return "";
}
