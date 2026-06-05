import { cn } from "@/lib/utils";
import { POS_PRODUCT_TILE_MIN_CLASS } from "@/lib/pos/pos-spacing-tokens";

/** WCAG 2.5.5 — minimum 44×44 CSS px; kitchen handheld primary target 48px (12 in Tailwind). */
export const POS_WCAG_FLOOR_PX = 44;
export const POS_MIN_TOUCH_PX = 48;

export const posTouchButtonClass = cn(
  "min-h-12 min-w-12 touch-manipulation",
);

export const posTouchTileClass = cn(
  POS_PRODUCT_TILE_MIN_CLASS,
  "touch-manipulation",
);

/** Secondary POS taps — 44px floor (Tailwind min-h-11 / min-w-11). */
export const posTouchCompactClass = cn(
  "min-h-11 min-w-11 touch-manipulation",
);

/** Form fields on POS cart panel — 44px height floor. */
export const posTouchInputClass = cn(
  "h-11 min-h-11 touch-manipulation",
);

/** Select triggers — standard (44px) and register/payment (48px). */
export const posTouchSelectClass = cn(
  "h-11 min-h-11 rounded-xl touch-manipulation",
);

export const posTouchSelectLargeClass = cn(
  "h-12 min-h-12 rounded-xl text-base touch-manipulation",
);

/** Primary checkout CTA — oversized for gloved / speed-mode use. */
export const posCheckoutButtonClass = cn(
  "h-14 min-h-14 w-full rounded-2xl text-lg font-semibold touch-manipulation",
);

/** Surfaces that must import touch helpers — checked by era17 cert. */
export const POS_TOUCH_TARGET_CONSUMERS = [
  "components/dashboard/pos-terminal-client.tsx",
  "components/pos/pos-tablet-client.tsx",
  "components/pos/handheld-ordering-client.tsx",
  "components/pos/tab-panel.tsx",
  "components/pos/quick-order-buttons.tsx",
] as const;
