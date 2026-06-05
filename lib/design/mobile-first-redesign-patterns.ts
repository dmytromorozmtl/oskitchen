import type { PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import { detectPosSwipe } from "@/lib/pos/pos-mobile-gestures";
import {
  MOBILE_FIRST_SWIPE_MIN_PX,
  MOBILE_FIRST_TOUCH_FLOOR_PX,
  MOBILE_FIRST_VIEWPORT_PX,
} from "@/lib/design/mobile-first-redesign-policy";

/** Header icon buttons — account, theme-adjacent chrome (44px floor). */
export const dashboardChromeButtonClass = cn(
  "min-h-11 min-w-11 touch-manipulation rounded-full",
);

/** Primary nav drawer trigger — readable label + 44px floor. */
export const dashboardChromeNavTriggerClass = cn(
  "min-h-11 touch-manipulation rounded-full gap-2 px-4",
);

/** Role switcher pills — horizontal scroll friendly, 44px height. */
export const dashboardNavPillClass = cn(
  "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium touch-manipulation",
);

/** Shortcut tiles on role dashboards — full-width tap on 375px. */
export const dashboardShortcutTileClass = cn(
  "flex min-h-11 flex-col justify-center rounded-lg border border-border/80 bg-muted/20 p-3 touch-manipulation transition-colors hover:bg-muted/40",
);

export type DashboardSwipeHandlers = {
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: () => void;
  touchAction: string;
};

/** Swipe left on the nav drawer to dismiss (one-hand phone use). */
export function createDashboardSwipeHandlers(input: {
  onSwipeLeft?: () => void;
  minDistance?: number;
}): DashboardSwipeHandlers {
  let start: { x: number; y: number } | null = null;

  return {
    touchAction: "pan-y",
    onPointerDown: (event) => {
      start = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerUp: (event) => {
      if (!start) return;
      const end = { x: event.clientX, y: event.clientY };
      const direction = detectPosSwipe(start, end, input.minDistance ?? MOBILE_FIRST_SWIPE_MIN_PX);
      start = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // pointer may already be released
      }
      if (direction === "left") input.onSwipeLeft?.();
    },
    onPointerCancel: () => {
      start = null;
    },
  };
}

export function mobileFirstRedesignSummary(): {
  viewportPx: number;
  touchFloorPx: number;
  swipeMinPx: number;
} {
  return {
    viewportPx: MOBILE_FIRST_VIEWPORT_PX,
    touchFloorPx: MOBILE_FIRST_TOUCH_FLOOR_PX,
    swipeMinPx: MOBILE_FIRST_SWIPE_MIN_PX,
  };
}
