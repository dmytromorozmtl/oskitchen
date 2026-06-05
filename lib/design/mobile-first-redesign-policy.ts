import { cn } from "@/lib/utils";

/**
 * DES-25 — mobile-first redesign policy (375px viewport / 44px touch / swipe gestures).
 *
 * @see lib/design/mobile-first-redesign-patterns.ts
 * @see lib/design/mobile-first-redesign-audit-policy.ts
 */

export const MOBILE_FIRST_REDESIGN_POLICY_ID = "mobile-first-redesign-des25-v1" as const;

/** iPhone SE / compact phone baseline for operator field flows. */
export const MOBILE_FIRST_VIEWPORT_PX = 375 as const;

/** WCAG 2.5.5 minimum interactive target (44×44 CSS px). */
export const MOBILE_FIRST_TOUCH_FLOOR_PX = 44 as const;

/** Horizontal swipe distance before nav drawer dismisses. */
export const MOBILE_FIRST_SWIPE_MIN_PX = 48 as const;

/** Operator chrome audited for 375px + 44px floor + swipe-to-close nav. */
export const MOBILE_FIRST_REDESIGN_MODULES = [
  "components/dashboard/dashboard-shell.tsx",
  "components/dashboard/roles-subnav.tsx",
  "components/roles/owner-role-panel.tsx",
  "components/roles/manager-role-panel.tsx",
  "components/command-center/command-center-panel.tsx",
] as const;

export const MOBILE_FIRST_PATTERN_IMPORT = "@/lib/design/mobile-first-redesign-patterns" as const;

export const MOBILE_FIRST_FORBIDDEN_BUTTON_HEIGHT_PATTERN = /\bButton\b[^;\n]*\bsize="sm"\b/g;

export const MOBILE_FIRST_TOUCH_TOKEN_PATTERN =
  /\bmin-h-11\b|\bmin-h-12\b|\bdashboardChrome(?:NavTrigger|Button)Class\b|\bdashboardNavPillClass\b|\bdashboardShortcutTileClass\b/g;

export const dashboardMainMobileClass = cn(
  "flex-1 px-4 py-6 pb-24 sm:px-8 sm:py-8 lg:pb-8",
);
