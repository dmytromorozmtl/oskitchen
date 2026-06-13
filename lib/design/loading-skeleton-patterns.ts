/**
 * DES-28 — loading skeleton patterns for dashboard routes.
 *
 * @see lib/design/loading-skeleton-audit-policy.ts
 * @see components/feedback/loading-skeleton.tsx
 */

export const LOADING_SKELETON_PATTERNS_POLICY_ID = "loading-skeleton-patterns-des28-v1" as const;

/** Route-level loading.tsx files audited for skeleton primitives (DES-28). */
export const LOADING_SKELETON_CRITICAL_MODULES = [
  "app/dashboard/today/loading.tsx",
  "app/dashboard/marketplace/loading.tsx",
  "app/dashboard/marketplace/checkout/loading.tsx",
  "app/dashboard/pos/loading.tsx",
  "app/dashboard/pos/terminal/loading.tsx",
  "app/dashboard/kitchen/loading.tsx",
  "app/dashboard/kitchen/production/loading.tsx",
  "app/dashboard/inventory/loading.tsx",
  "app/dashboard/orders/loading.tsx",
  "app/dashboard/today/profit/loading.tsx",
  "app/dashboard/integrations/health/loading.tsx",
  "app/dashboard/analytics/suite/loading.tsx",
] as const;

/** Named async-page skeleton components (Absolute Final Task 21). */
export const ASYNC_PAGE_SKELETON_COMPONENTS = [
  "components/dashboard/today-skeleton.tsx",
  "components/dashboard/marketplace-skeleton.tsx",
  "components/dashboard/pos-skeleton.tsx",
  "components/dashboard/kds-skeleton.tsx",
  "components/dashboard/inventory-skeleton.tsx",
  "components/dashboard/money-page-skeletons.tsx",
  "components/analytics/analytics-suite-skeleton.tsx",
] as const;

/** Spinner-only loading acceptable on full-screen operator surfaces. */
export const LOADING_SKELETON_EXCEPTION_MODULES = [] as const;

export const LOADING_SKELETON_EXCEPTION_MARKER = "LOADING_SKELETON_EXCEPTION" as const;

export const LOADING_SKELETON_IMPORT = "@/components/feedback/loading-skeleton" as const;

/** Shared skeleton surfaces — dark-mode safe (DES-37). */
export const SKELETON_SURFACE_CLASS = "border-border/80 bg-card/90 dark:bg-card/80" as const;

export const SKELETON_WIZARD_SURFACE_CLASS =
  "border-primary/20 bg-primary/[0.03] shadow-sm dark:border-primary/30 dark:bg-primary/10" as const;

export const SKELETON_PULSE_CLASS = "bg-muted/60 dark:bg-muted/40" as const;

export const SKELETON_DARK_MODE_TOKENS = [
  "dark:bg-muted/40",
  "dark:bg-card/80",
  "dark:border-primary/30",
  "dark:bg-primary/10",
] as const;

export const ERROR_SKELETON_DARK_MODE_AUDIT_POLICY_ID =
  "error-skeleton-dark-mode-audit-des37-v1" as const;

/** Error + skeleton components audited for dark mode (Task 25). */
export const ERROR_SKELETON_DARK_MODE_MODULES = [
  "components/feedback/error-state.tsx",
  "components/feedback/error-state-illustration.tsx",
  "components/feedback/retryable-error-state.tsx",
  "components/ui/api-error-state.tsx",
  "components/dashboard/route-states.tsx",
  "components/dashboard/pilot-route-states.tsx",
  "components/feedback/loading-skeleton.tsx",
  "components/dashboard/today-skeleton.tsx",
  "components/dashboard/marketplace-skeleton.tsx",
  "components/dashboard/pos-skeleton.tsx",
  "components/dashboard/kds-skeleton.tsx",
  "components/dashboard/inventory-skeleton.tsx",
  "components/dashboard/money-page-skeletons.tsx",
] as const;

export const LOADING_SKELETON_PRIMITIVE_PATTERN =
  /PageSkeleton|DashboardPageSkeleton|LoadingSkeleton|TableSkeleton|CardGridSkeleton|KPISkeleton|ChartSkeleton|TodaySkeleton|MarketplaceSkeleton|POSSkeleton|KDSSkeleton|InventorySkeleton|AnalyticsSuiteSkeleton|POSCheckoutSkeleton|MarketplaceCartSkeleton|VendorFinanceSkeleton/;

export type LoadingSkeletonCriticalModule = (typeof LOADING_SKELETON_CRITICAL_MODULES)[number];
export type LoadingSkeletonExceptionModule = (typeof LOADING_SKELETON_EXCEPTION_MODULES)[number];
