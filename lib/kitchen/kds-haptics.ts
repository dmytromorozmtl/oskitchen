/**
 * KDS haptic feedback — Vibration API for bump/recall on kitchen tablets.
 *
 * Safe no-op on desktop Safari and unsupported browsers.
 *
 * @see lib/ux/mobile-pos-kds-policy.ts
 */

export type KdsHapticKind = "bump" | "recall" | "error";

/** Short bump pulse — 12ms. */
export const KDS_HAPTIC_BUMP_MS = 12 as const;

/** Recall — double pulse. */
export const KDS_HAPTIC_RECALL_PATTERN = [12, 24, 12] as const;

/** Action error — alert pattern. */
export const KDS_HAPTIC_ERROR_PATTERN = [35, 18, 35] as const;

const HAPTIC_PATTERNS: Record<KdsHapticKind, number | readonly number[]> = {
  bump: KDS_HAPTIC_BUMP_MS,
  recall: KDS_HAPTIC_RECALL_PATTERN,
  error: KDS_HAPTIC_ERROR_PATTERN,
};

export function isKdsHapticSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function triggerKdsHaptic(kind: KdsHapticKind): boolean {
  if (!isKdsHapticSupported()) return false;
  try {
    return navigator.vibrate(HAPTIC_PATTERNS[kind] as number | number[]);
  } catch {
    return false;
  }
}
