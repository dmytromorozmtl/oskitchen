/**
 * DES-29 — canonical PageSection patterns for dashboard content blocks.
 *
 * @see lib/design/page-section-audit-policy.ts
 * @see components/layout/page-section.tsx
 */

export const PAGE_SECTION_PATTERNS_POLICY_ID = "page-section-patterns-des29-v1" as const;

export const PAGE_SECTION_TITLE_CLASS = "text-lg font-semibold tracking-tight" as const;

/** Dashboard routes audited for shared section scaffold (DES-29). */
export const PAGE_SECTION_CRITICAL_MODULES = [
  "app/dashboard/marketplace/page.tsx",
  "app/dashboard/today/profit/page.tsx",
  "app/dashboard/integrations/health/page.tsx",
] as const;

/**
 * Card-embedded or command-center sections — exempt from PageSection requirement.
 * Must document exception in source via PAGE_SECTION_EXCEPTION.
 */
export const PAGE_SECTION_EXCEPTION_MODULES = [
  "app/dashboard/today/page.tsx",
  "app/dashboard/pos/terminal/page.tsx",
] as const;

export const PAGE_SECTION_EXCEPTION_MARKER = "PAGE_SECTION_EXCEPTION" as const;

export const PAGE_SECTION_IMPORT = "@/components/layout/page-section" as const;

export const PAGE_SECTION_PRIMITIVE_PATTERN = /PageSection/;

export type PageSectionCriticalModule = (typeof PAGE_SECTION_CRITICAL_MODULES)[number];
export type PageSectionExceptionModule = (typeof PAGE_SECTION_EXCEPTION_MODULES)[number];
