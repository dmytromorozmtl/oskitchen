/**
 * iPad-native POS haptic feedback — Vibration API patterns for tablet checkout.
 *
 * Android Chrome + supported browsers; no-op when unavailable (desktop Safari).
 *
 * @see lib/pos/ipad-native-pos-polish-policy.ts
 */

export type IpadNativePosHapticKind = "tap" | "success" | "error";

/** Short tap on product add — 10ms pulse. */
export const IPAD_NATIVE_POS_HAPTIC_TAP_MS = 10 as const;

/** Success checkout — double pulse. */
export const IPAD_NATIVE_POS_HAPTIC_SUCCESS_PATTERN = [15, 30, 15] as const;

/** Error / validation — stronger alert pattern. */
export const IPAD_NATIVE_POS_HAPTIC_ERROR_PATTERN = [40, 20, 40] as const;

const HAPTIC_PATTERNS: Record<IpadNativePosHapticKind, number | readonly number[]> = {
  tap: IPAD_NATIVE_POS_HAPTIC_TAP_MS,
  success: IPAD_NATIVE_POS_HAPTIC_SUCCESS_PATTERN,
  error: IPAD_NATIVE_POS_HAPTIC_ERROR_PATTERN,
};

export function isIpadNativePosHapticSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/** Fire haptic pulse when Vibration API is available. Safe no-op elsewhere. */
export function triggerIpadNativePosHaptic(kind: IpadNativePosHapticKind): boolean {
  if (!isIpadNativePosHapticSupported()) return false;
  try {
    return navigator.vibrate(HAPTIC_PATTERNS[kind] as number | number[]);
  } catch {
    return false;
  }
}
