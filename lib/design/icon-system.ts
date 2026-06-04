/**
 * DES-25 — canonical Lucide icon sizes for OS Kitchen surfaces.
 *
 * @see lib/design/icon-system-audit-policy.ts
 * @see components/ui/app-icon.tsx
 */

export const APP_ICON_SIZES = {
  /** 12px — badge status dots, compact inline indicators. */
  xs: { px: 12, className: "h-3 w-3" },
  /** 14px — badges, chips, link trailing icons. */
  sm: { px: 14, className: "h-3.5 w-3.5" },
  /** 16px — default nav, buttons, list rows. */
  md: { px: 16, className: "h-4 w-4" },
  /** 20px — card headers, quick actions, emphasis. */
  lg: { px: 20, className: "h-5 w-5" },
  /** 24px — feature tiles, floating widgets, empty-state hero. */
  xl: { px: 24, className: "h-6 w-6" },
} as const;

export type AppIconSize = keyof typeof APP_ICON_SIZES;

export const appIconXsClass = APP_ICON_SIZES.xs.className;
export const appIconSmClass = APP_ICON_SIZES.sm.className;
export const appIconMdClass = APP_ICON_SIZES.md.className;
export const appIconLgClass = APP_ICON_SIZES.lg.className;
export const appIconXlClass = APP_ICON_SIZES.xl.className;

/** Header nav, dropdown rows, icon buttons. */
export const appIconNavClass = appIconMdClass;
/** Badge and chip leading icons. */
export const appIconBadgeClass = appIconSmClass;
/** Card titles and section headers. */
export const appIconHeaderClass = appIconLgClass;
/** FAB, empty-state card hero, integration tile. */
export const appIconHeroClass = appIconXlClass;

/** 40×40 category / integration tile shell (icon uses `xl`). */
export const appIconTileContainerClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl";

export function appIconSizeClass(size: AppIconSize): string {
  return APP_ICON_SIZES[size].className;
}

/** Modules audited for zero raw `h-N w-N` on Lucide icons (DES-25). */
export const ICON_SYSTEM_MODULES = [
  "components/dashboard/integration-health-strip.tsx",
  "components/dashboard/dashboard-shell.tsx",
  "components/dashboard/today-command-center.tsx",
  "components/dashboard/support-widget.tsx",
  "components/ui/empty-state.tsx",
  "components/dashboard/settings/health-overview.tsx",
  "components/dashboard/settings/bridge-card.tsx",
  "components/marketplace/marketplace-category-icon.tsx",
] as const;
