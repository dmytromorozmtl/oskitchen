/**
 * DES-27 — canonical page layout patterns (PageHeader + PageShell).
 *
 * @see lib/design/page-layout-audit-policy.ts
 * @see components/layout/page-header.tsx
 * @see components/layout/page-shell.tsx
 */

export const PAGE_LAYOUT_PATTERNS_POLICY_ID = "page-layout-patterns-des27-v1" as const;

export const PAGE_HEADER_TITLE_CLASS = "text-3xl font-semibold tracking-tight" as const;

/** Dashboard routes audited for shared layout primitives (DES-27). */
export const PAGE_LAYOUT_CRITICAL_MODULES = [
  "app/dashboard/integrations/health/page.tsx",
  "app/dashboard/marketplace/page.tsx",
  "app/dashboard/marketplace/orders/page.tsx",
  "app/dashboard/today/profit/page.tsx",
] as const;

/**
 * Routes with bespoke command-center / terminal chrome — exempt from PageHeader requirement.
 * Must still document layout exception in source via PAGE_LAYOUT_EXCEPTION.
 */
export const PAGE_LAYOUT_EXCEPTION_MODULES = [
  "app/dashboard/today/page.tsx",
  "app/dashboard/pos/terminal/page.tsx",
] as const;

export const PAGE_LAYOUT_EXCEPTION_MARKER = "PAGE_LAYOUT_EXCEPTION" as const;

export const PAGE_HEADER_IMPORT = '@/components/layout/page-header' as const;
export const PAGE_SHELL_IMPORT = '@/components/layout/page-shell' as const;

export type PageLayoutCriticalModule = (typeof PAGE_LAYOUT_CRITICAL_MODULES)[number];
export type PageLayoutExceptionModule = (typeof PAGE_LAYOUT_EXCEPTION_MODULES)[number];
