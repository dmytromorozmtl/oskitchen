import { cn } from "@/lib/utils";
import { MOBILE_FIRST_TOUCH_FLOOR_PX } from "@/lib/design/mobile-first-redesign-policy";

/** WCAG 2.5.5 floor — 44×44 CSS px on kitchen tablet/phone. */
export const KDS_WCAG_FLOOR_PX = MOBILE_FIRST_TOUCH_FLOOR_PX;

/** Primary bump CTA — oversized for gloved expo line (56px). */
export const kdsBumpButtonClass = cn(
  "min-h-14 w-full rounded-xl px-4 py-3 text-base font-bold touch-manipulation",
  "transition-all active:scale-95",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
);

/** Recall to prep — 48px primary kitchen target. */
export const kdsRecallButtonClass = cn(
  "min-h-12 w-full rounded-xl px-4 py-3 text-base font-bold touch-manipulation",
  "transition-all active:scale-95",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
);

/** Inline next-action pill — 44px floor. */
export const kdsTouchPillClass = cn(
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3",
  "text-sm font-semibold touch-manipulation",
);

/** Surfaces audited for mobile/tablet KDS touch floor (Blueprint P1-27). */
export const KDS_TOUCH_TARGET_CONSUMERS = [
  "components/kitchen/kds-daily-service.tsx",
  "components/kitchen/kds-bump-next-strip.tsx",
  "components/kitchen/kds-ticket-row-next-action.tsx",
] as const;
