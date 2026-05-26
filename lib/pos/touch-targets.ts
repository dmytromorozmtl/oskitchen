import { cn } from "@/lib/utils";

/** WCAG 2.5.5 — minimum 44×44 CSS px; kitchen handheld target 48px (12 in Tailwind). */
export const POS_MIN_TOUCH_PX = 48;

export const posTouchButtonClass = cn(
  "min-h-12 min-w-12 touch-manipulation",
);

export const posTouchTileClass = cn(
  "min-h-[120px] touch-manipulation",
);

export const posTouchCompactClass = cn(
  "min-h-11 min-w-11 touch-manipulation",
);
