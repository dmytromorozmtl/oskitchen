/**
 * DES-34 — canonical EmptyState patterns for dashboard empty and zero-data views.
 *
 * @see lib/design/empty-state-audit-policy.ts
 * @see components/ui/empty-state.tsx
 */

export const EMPTY_STATE_PATTERNS_POLICY_ID = "empty-state-patterns-des34-v1" as const;

export const EMPTY_STATE_TEST_ID = "empty-state" as const;

export const EMPTY_STATE_CARD_CLASS =
  "border-dashed border-border/80 bg-muted/10 shadow-none" as const;

export const EMPTY_STATE_INLINE_CLASS =
  "rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center" as const;

/** Routes audited for shared EmptyState primitive (DES-34). */
export const EMPTY_STATE_CRITICAL_MODULES = [
  "components/ui/empty-state.tsx",
  "components/dashboard/today-command-center.tsx",
  "app/dashboard/marketplace/catalog/page.tsx",
  "components/kitchen/kds-daily-service.tsx",
  "components/dashboard/route-states.tsx",
  "app/dashboard/settings/voice/page.tsx",
] as const;

/**
 * Dense table cell placeholders — exempt when documented.
 * Must include EMPTY_STATE_EXCEPTION in source.
 */
export const EMPTY_STATE_EXCEPTION_MODULES = [] as const;

export const EMPTY_STATE_EXCEPTION_MARKER = "EMPTY_STATE_EXCEPTION" as const;

export const EMPTY_STATE_IMPORT = "@/components/ui/empty-state" as const;

export const EMPTY_STATE_REEXPORT_IMPORT = "@/components/dashboard/empty-state" as const;

export const EMPTY_STATE_PRIMITIVE_PATTERN = /EmptyState/;

export type EmptyStateCriticalModule = (typeof EMPTY_STATE_CRITICAL_MODULES)[number];
