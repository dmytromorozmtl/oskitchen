import type { PointerEvent as ReactPointerEvent } from "react";

import { POS_MOBILE_SWIPE_MIN_DISTANCE_PX } from "@/lib/pos/pos-mobile-pos-policy";

export type PosSwipeDirection = "left" | "right" | "up" | "down";

export type PosSwipePoint = {
  x: number;
  y: number;
};

export function detectPosSwipe(
  start: PosSwipePoint,
  end: PosSwipePoint,
  minDistance: number = POS_MOBILE_SWIPE_MIN_DISTANCE_PX,
): PosSwipeDirection | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) return null;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

export type PosSwipePointerHandlers = {
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: () => void;
};

/** Attach swipe detection to a touch target (product row, cart handle, etc.). */
export function createPosSwipeHandlers(input: {
  onSwipe?: (direction: PosSwipeDirection) => void;
  onTap?: () => void;
  minDistance?: number;
}): PosSwipePointerHandlers & { touchAction: string } {
  let start: PosSwipePoint | null = null;
  let moved = false;

  return {
    touchAction: "pan-y",
    onPointerDown: (event) => {
      start = { x: event.clientX, y: event.clientY };
      moved = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerUp: (event) => {
      if (!start) return;
      const end = { x: event.clientX, y: event.clientY };
      const direction = detectPosSwipe(start, end, input.minDistance);
      start = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // pointer may already be released
      }
      if (direction) {
        moved = true;
        input.onSwipe?.(direction);
        return;
      }
      if (!moved) input.onTap?.();
    },
    onPointerCancel: () => {
      start = null;
      moved = false;
    },
  };
}
