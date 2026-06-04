/**
 * DES-30 — canonical filter/search UX patterns for dashboard list and report routes.
 *
 * @see lib/design/filter-search-audit-policy.ts
 * @see components/dashboard/filter-search-shell.tsx
 */

export const FILTER_SEARCH_PATTERNS_POLICY_ID = "filter-search-patterns-des30-v1" as const;

export const FILTER_SEARCH_BAR_TEST_ID = "filter-search-bar" as const;

export const FILTER_SEARCH_SHELL_CLASS = "border-border/80 shadow-sm" as const;

export const FILTER_CHIP_BASE_CLASS =
  "rounded-full px-3 py-1 text-xs font-medium transition-colors" as const;

export const FILTER_CHIP_ACTIVE_CLASS = "bg-primary text-primary-foreground" as const;

export const FILTER_CHIP_INACTIVE_CLASS =
  "bg-muted text-muted-foreground hover:bg-muted/70" as const;

/** Filter bar modules audited for shared shell + chip tokens (DES-30). */
export const FILTER_SEARCH_CRITICAL_MODULES = [
  "components/dashboard/analytics-filter-bar.tsx",
  "components/dashboard/reports/report-filter-bar.tsx",
  "components/dashboard/executive/executive-filter-bar.tsx",
  "components/marketplace/catalog-filter-bar.tsx",
] as const;

/**
 * Bespoke mobile Sheet/drawer filter UX — exempt when documented.
 * Must include FILTER_SEARCH_EXCEPTION in source.
 */
export const FILTER_SEARCH_EXCEPTION_MODULES = [] as const;

export const FILTER_SEARCH_EXCEPTION_MARKER = "FILTER_SEARCH_EXCEPTION" as const;

export const FILTER_SEARCH_SHELL_IMPORT = "@/components/dashboard/filter-search-shell" as const;

export const FILTER_SEARCH_PRIMITIVE_PATTERN = /FilterSearchShell|FilterChipLink/;

export type FilterSearchCriticalModule = (typeof FILTER_SEARCH_CRITICAL_MODULES)[number];
