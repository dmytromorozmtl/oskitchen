import { cn } from "@/lib/utils";

/** WCAG 2.5.5 — QR guest flows target 375px phones; 44px floor, 48px primary CTAs. */
export const QR_GUEST_WCAG_FLOOR_PX = 44;
export const QR_GUEST_PRIMARY_TOUCH_PX = 48;

/** Category pills and icon qty controls — 44px minimum. */
export const qrGuestTouchCompactClass = cn(
  "min-h-11 min-w-11 touch-manipulation",
);

/** Sticky cart / place-order CTAs — oversized thumb target. */
export const qrGuestPrimaryCtaClass = cn(
  "min-h-12 w-full touch-manipulation text-base font-semibold",
);

/** Category strip pills — horizontal scroll, 44px height. */
export const qrGuestCategoryPillClass = cn(
  "min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-medium touch-manipulation",
);

/** Phone-first shell — dynamic viewport + centered column. */
export const qrGuestShellClass = cn(
  "mx-auto min-h-[100dvh] max-w-lg",
);

/** Bottom sticky bar — home-indicator safe area. */
export const qrGuestStickyFooterClass = cn(
  "fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur",
  "pb-[max(1rem,env(safe-area-inset-bottom))]",
);

/** Cart drawer sheet — safe area padding. */
export const qrGuestDrawerSheetClass = cn(
  "max-h-[85dvh] rounded-t-3xl border border-zinc-800 bg-zinc-900 p-4",
  "pb-[max(1rem,env(safe-area-inset-bottom))]",
);

export const QR_GUEST_TOUCH_CONSUMERS = [
  "components/qr/qr-ordering-client.tsx",
  "components/qr/qr-table-self-service-client.tsx",
] as const;
