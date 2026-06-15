/**
 * iPad-native POS swipe gestures — swipe-right to add on tablet product tiles.
 *
 * @see lib/pos/pos-mobile-gestures.ts
 * @see lib/pos/ipad-native-pos-polish-policy.ts
 */

import { createPosSwipeHandlers } from "@/lib/pos/pos-mobile-gestures";

/** Tablet counter — slightly longer swipe than phone for gloved use. */
export const IPAD_NATIVE_POS_SWIPE_MIN_PX = 56 as const;

export function createPosTabletSwipeHandlers(input: {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onTap?: () => void;
}) {
  return createPosSwipeHandlers({
    minDistance: IPAD_NATIVE_POS_SWIPE_MIN_PX,
    onTap: input.onTap,
    onSwipe: (direction) => {
      if (direction === "right") input.onSwipeRight?.();
      if (direction === "left") input.onSwipeLeft?.();
    },
  });
}
