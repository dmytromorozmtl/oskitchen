/**
 * DES-35 — canonical MetricCard patterns for dashboard KPI strips.
 *
 * @see lib/design/metric-card-audit-policy.ts
 * @see components/data-display/metric-card.tsx
 */

export const METRIC_CARD_PATTERNS_POLICY_ID = "metric-card-patterns-des35-v1" as const;

export const METRIC_CARD_TEST_ID = "metric-card" as const;

export const METRIC_CARD_CLASS = "border-border/80 bg-card/90 shadow-sm" as const;

export const METRIC_CARD_ACCENT_CLASS = "border-amber-500/30 bg-amber-500/5" as const;

/** KPI strip modules audited for shared MetricCard primitive (DES-35). */
export const METRIC_CARD_CRITICAL_MODULES = [
  "components/data-display/metric-card.tsx",
  "app/dashboard/marketplace/page.tsx",
  "components/marketplace/vendor-dashboard-client.tsx",
  "components/dashboard/menu-center.tsx",
] as const;

/**
 * Bespoke benchmark percentile gauges or platform dark chrome — exempt when documented.
 * Must include METRIC_CARD_EXCEPTION in source.
 */
export const METRIC_CARD_EXCEPTION_MODULES = [
  "components/dashboard/benchmark-dashboard.tsx",
  "components/platform/marketplace-analytics-admin-client.tsx",
] as const;

export const METRIC_CARD_EXCEPTION_MARKER = "METRIC_CARD_EXCEPTION" as const;

export const METRIC_CARD_IMPORT = "@/components/data-display/metric-card" as const;

export const METRIC_CARD_PRIMITIVE_PATTERN = /MetricCard/;

export type MetricCardCriticalModule = (typeof METRIC_CARD_CRITICAL_MODULES)[number];
