import { cn } from "@/lib/utils";
import { MOBILE_FIRST_TOUCH_FLOOR_PX } from "@/lib/design/mobile-first-redesign-policy";

/**
 * KDS tablet landscape layout — iPad-class kitchen display (1024×768 baseline).
 *
 * @see lib/design/mobile-first-redesign-absolute-final-policy.ts
 */

export type KdsTabletOrientation = "portrait" | "landscape";

/** Standard iPad landscape kitchen display baseline. */
export const KDS_TABLET_LANDSCAPE_WIDTH_PX = 1024 as const;

export const KDS_TABLET_LANDSCAPE_HEIGHT_PX = 768 as const;

export const KDS_TABLET_TOUCH_FLOOR_PX = MOBILE_FIRST_TOUCH_FLOOR_PX;

export function getKdsTabletOrientation(): KdsTabletOrientation {
  if (typeof window === "undefined") return "landscape";
  return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
}

export function subscribeKdsTabletOrientation(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const media = window.matchMedia("(orientation: portrait)");
  const handler = () => onStoreChange();
  media.addEventListener("change", handler);
  return () => media.removeEventListener("change", handler);
}

/** Full-width KDS board shell — touch-manipulation for expo bump targets. */
export function kdsTabletLandscapeShellClass(): string {
  return cn("kds-tablet-landscape-shell touch-manipulation min-h-0 w-full");
}

/** Prep + expo lanes side-by-side on landscape tablet. */
export function kdsTabletLandscapeLaneLayoutClass(): string {
  return cn(
    "kds-tablet-landscape-lanes space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0",
  );
}

/** Ticket card grid — 2-up on tablet portrait, 3–4 on landscape. */
export function kdsTabletLandscapeTicketGridClass(): string {
  return cn(
    "kds-tablet-landscape-ticket-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
  );
}
