/**
 * P1-26 — gated dashboard pages must render PermissionDeniedSurfaceCard, not notFound().
 */

export const GATED_PAGE_PERMISSION_DENIED_POLICY_ID = "gated-page-permission-denied-p1-26-v1" as const;

/** RBAC-gated routes wired to PermissionDeniedSurfaceCard (Blueprint P1-26). */
export const GATED_PAGE_PERMISSION_DENIED_MODULES = [
  "app/dashboard/marketplace/page.tsx",
  "app/dashboard/marketplace/catalog/page.tsx",
  "app/dashboard/marketplace/orders/page.tsx",
  "app/dashboard/marketplace/checkout/page.tsx",
  "app/dashboard/command-center/page.tsx",
  "app/dashboard/staff/schedule/page.tsx",
  "app/dashboard/settings/layout.tsx",
  "app/dashboard/settings/security/page.tsx",
  "app/dashboard/settings/billing/page.tsx",
  "app/dashboard/settings/notifications/page.tsx",
] as const;

export const GATED_PAGE_FORBIDDEN_DENIAL_PATTERNS = [
  /if \(!canUseSettings\(actor[^)]+\)\) notFound\(\)/,
  /Owner or leadership access required/,
] as const;

export const GATED_PAGE_PERMISSION_DENIED_CI_SCRIPTS = [
  "test:ci:gated-page-permission-denied",
] as const;
