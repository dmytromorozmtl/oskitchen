/**
 * DES-33 — canonical error state patterns for route boundaries and feature failures.
 *
 * @see lib/design/error-state-audit-policy.ts
 * @see components/feedback/error-state.tsx
 * @see components/ui/api-error-state.tsx
 * @see components/dashboard/route-states.tsx
 */

export const ERROR_STATE_PATTERNS_POLICY_ID = "error-state-patterns-des33-v1" as const;

export const ERROR_STATE_TEST_ID = "error-state" as const;

export const ERROR_STATE_ILLUSTRATION_TEST_ID = "error-state-illustration" as const;

export const API_ERROR_STATE_TEST_ID = "api-error-state" as const;

export const ERROR_STATE_CARD_CLASS =
  "border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10" as const;

export const ERROR_STATE_ROUTE_WRAPPER_CLASS =
  "flex min-h-[400px] flex-col items-center justify-center gap-4 px-4" as const;

export const ERROR_STATE_FLEET_AUDIT_POLICY_ID = "error-state-fleet-audit-des34-v1" as const;

export const ERROR_STATE_REEXPORT_PATTERN =
  /export\s+\{\s*default\s*\}\s+from\s+["']([^"']+)["']/;

export const ERROR_STATE_DARK_MODE_TOKENS = [
  "dark:border-destructive/40",
  "dark:bg-destructive/10",
  "dark:text-destructive/80",
] as const;

/** Route and feature error surfaces audited for shared primitives (DES-33). */
export const ERROR_STATE_CRITICAL_MODULES = [
  "components/dashboard/today-page-load-error.tsx",
  "components/dashboard/route-states.tsx",
  "components/dashboard/ai-feature-api-error.tsx",
  "app/dashboard/integrations/email-orders/error.tsx",
  "app/dashboard/integrations/google-forms/error.tsx",
  "app/dashboard/analytics/advanced/error.tsx",
] as const;

/**
 * Terminal-only bespoke error chrome — exempt when documented.
 * Must include ERROR_STATE_EXCEPTION in source.
 */
export const ERROR_STATE_EXCEPTION_MODULES = [
  "app/dashboard/pos/terminal/error.tsx",
] as const;

export const ERROR_STATE_EXCEPTION_MARKER = "ERROR_STATE_EXCEPTION" as const;

export const ERROR_STATE_IMPORT = "@/components/feedback/error-state" as const;

export const API_ERROR_STATE_IMPORT = "@/components/ui/api-error-state" as const;

export const ROUTE_ERROR_IMPORT = "@/components/dashboard/route-states" as const;

export const ERROR_STATE_PRIMITIVE_PATTERN =
  /ErrorState|ApiErrorState|RouteError|AiFeatureApiError/;

export type ErrorStateCriticalModule = (typeof ERROR_STATE_CRITICAL_MODULES)[number];
