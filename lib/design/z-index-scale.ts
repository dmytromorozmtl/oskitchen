/**
 * DES-23 — canonical z-index scale for OS Kitchen surfaces.
 *
 * @see lib/design/z-index-audit-policy.ts
 * @see tailwind.config.ts theme.extend.zIndex
 */

export const Z_INDEX_SCALE = {
  /** In-page sticky rows (table headers, local toolbars). */
  sticky: 10,
  /** Section sticky headers (QR guest, KDS bar, launch wizard strip). */
  stickyHeader: 20,
  /** App chrome — dashboard/platform header, sticky save bars. */
  chrome: 30,
  /** Drawers, sidebars, mobile cart FAB, marketing header. */
  drawer: 40,
  /** Modal/sheet/popover overlay — matches shadcn default (50). */
  overlay: 50,
  /** Floating widgets — support bubble, offline pill, skip-link focus. */
  floating: 60,
  /** Operator tour backdrop. */
  tour: 70,
  tourHighlight: 71,
  tourCard: 72,
  /** KDS wall-tablet fullscreen shell — above tour, below nothing critical. */
  kitchenFullscreen: 90,
} as const;

export type ZIndexLayer = keyof typeof Z_INDEX_SCALE;

export const zStickyClass = "z-sticky" as const;
export const zStickyHeaderClass = "z-sticky-header" as const;
export const zChromeClass = "z-chrome" as const;
export const zDrawerClass = "z-drawer" as const;
export const zOverlayClass = "z-overlay" as const;
export const zFloatingClass = "z-floating" as const;
export const zTourClass = "z-tour" as const;
export const zTourHighlightClass = "z-tour-highlight" as const;
export const zTourCardClass = "z-tour-card" as const;
export const zKitchenFullscreenClass = "z-kitchen-fullscreen" as const;

/** Modules audited for zero arbitrary z-[N] (DES-23). */
export const Z_INDEX_CLEANUP_MODULES = [
  "components/dashboard/kitchen-screen-client.tsx",
  "components/onboarding/operator-tour.tsx",
  "components/pos/handheld-ordering-client.tsx",
  "components/qr/qr-ordering-client.tsx",
  "components/qr/qr-table-self-service-client.tsx",
  "lib/qr/qr-guest-mobile-ui.ts",
  "components/kitchen/kds-realtime-connection-bar.tsx",
  "components/dashboard/dashboard-shell.tsx",
  "components/pwa/offline-indicator.tsx",
  "components/dashboard/support-widget.tsx",
  "components/marketplace/marketplace-mobile-cart-drawer.tsx",
  "components/feedback/feedback-launcher.tsx",
  "components/dashboard/settings/sticky-save-bar.tsx",
  "components/dashboard/operational-signal-bar.tsx",
  "components/platform/platform-chrome.tsx",
  "app/platform/layout.tsx",
] as const;
