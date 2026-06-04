/**
 * DES-31 — canonical table vs card list patterns for dashboard data views.
 *
 * @see lib/design/table-card-audit-policy.ts
 * @see components/tables/data-table-shell.tsx
 * @see components/tables/responsive-data-list.tsx
 */

export const TABLE_CARD_PATTERNS_POLICY_ID = "table-card-patterns-des31-v1" as const;

export const TABLE_CARD_SHELL_TEST_ID = "data-table-shell" as const;

export const TABLE_CARD_SHELL_CLASS =
  "overflow-x-auto rounded-2xl border border-border/80 bg-card/80 shadow-sm" as const;

export const TABLE_MOBILE_CARD_CLASS =
  "rounded-2xl border border-border/80 bg-card p-4 shadow-sm" as const;

/** Data list modules audited for shared table/card primitives (DES-31). */
export const TABLE_CARD_CRITICAL_MODULES = [
  "components/dashboard/orders-table.tsx",
  "app/dashboard/integrations/webhooks/page.tsx",
  "components/marketplace/marketplace-orders-list-client.tsx",
  "app/dashboard/costing/theft/page.tsx",
] as const;

/**
 * Dense operator terminals with fixed grid layouts — exempt when documented.
 * Must include TABLE_CARD_EXCEPTION in source.
 */
export const TABLE_CARD_EXCEPTION_MODULES = [
  "app/dashboard/pos/terminal/page.tsx",
] as const;

export const TABLE_CARD_EXCEPTION_MARKER = "TABLE_CARD_EXCEPTION" as const;

export const TABLE_CARD_SHELL_IMPORT = "@/components/tables/data-table-shell" as const;

export const TABLE_CARD_RESPONSIVE_IMPORT = "@/components/tables/responsive-data-list" as const;

export const TABLE_CARD_PRIMITIVE_PATTERN = /DataTableShell|ResponsiveDataList/;

export type TableCardCriticalModule = (typeof TABLE_CARD_CRITICAL_MODULES)[number];
export type TableCardExceptionModule = (typeof TABLE_CARD_EXCEPTION_MODULES)[number];
