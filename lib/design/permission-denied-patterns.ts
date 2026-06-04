/**
 * DES-37 — canonical permission-denied surface patterns (STABILIZATION E3).
 *
 * @see lib/design/permission-denied-audit-policy.ts
 * @see components/ui/permission-denied-card.tsx
 * @see lib/ux/permission-denied-copy.ts
 */

export const PERMISSION_DENIED_PATTERNS_POLICY_ID = "permission-denied-patterns-des37-v1" as const;

export const PERMISSION_DENIED_CARD_TEST_ID = "permission-denied-card" as const;

export const PERMISSION_DENIED_CARD_CLASS =
  "max-w-lg border-dashed border-border/80 bg-muted/10 shadow-none" as const;

/** RBAC-gated routes audited for PermissionDeniedSurfaceCard (DES-37). */
export const PERMISSION_DENIED_CRITICAL_MODULES = [
  "components/ui/permission-denied-card.tsx",
  "app/dashboard/pos/terminal/page.tsx",
  "app/dashboard/order-hub/page.tsx",
  "app/dashboard/reports/page.tsx",
  "app/dashboard/settings/pos/page.tsx",
  "app/dashboard/settings/backups/page.tsx",
] as const;

/**
 * Platform-only or API surfaces without standard RBAC card — exempt when documented.
 */
export const PERMISSION_DENIED_EXCEPTION_MODULES = [
  "app/dashboard/developers/page.tsx",
] as const;

export const PERMISSION_DENIED_EXCEPTION_MARKER = "PERMISSION_DENIED_EXCEPTION" as const;

export const PERMISSION_DENIED_CARD_IMPORT = "@/components/ui/permission-denied-card" as const;

export const PERMISSION_DENIED_SURFACE_IMPORT =
  "@/components/dashboard/permission-denied-surface-card" as const;

export const PERMISSION_DENIED_PRIMITIVE_PATTERN =
  /PermissionDeniedCard|PermissionDeniedSurfaceCard/;

export type PermissionDeniedCriticalModule =
  (typeof PERMISSION_DENIED_CRITICAL_MODULES)[number];
