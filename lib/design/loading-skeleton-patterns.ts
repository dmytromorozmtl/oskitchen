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
  "app/dashboard/pos/loading.tsx",
  "app/dashboard/kitchen/loading.tsx",
  "app/dashboard/kitchen/production/loading.tsx",
  "app/dashboard/orders/loading.tsx",
  "app/dashboard/today/profit/loading.tsx",
  "app/dashboard/integrations/health/loading.tsx",
] as const;

/** Named async-page skeleton components (Absolute Final Task 21). */
export const ASYNC_PAGE_SKELETON_COMPONENTS = [
  "components/dashboard/today-skeleton.tsx",
  "components/dashboard/marketplace-skeleton.tsx",
  "components/dashboard/pos-skeleton.tsx",
  "components/dashboard/kds-skeleton.tsx",
] as const;

/** Spinner-only loading acceptable on full-screen operator surfaces. */
export const LOADING_SKELETON_EXCEPTION_MODULES = [
  "app/dashboard/pos/terminal/loading.tsx",
] as const;

export const LOADING_SKELETON_EXCEPTION_MARKER = "LOADING_SKELETON_EXCEPTION" as const;

export const LOADING_SKELETON_IMPORT = "@/components/feedback/loading-skeleton" as const;

export const LOADING_SKELETON_PRIMITIVE_PATTERN =
  /PageSkeleton|DashboardPageSkeleton|LoadingSkeleton|TableSkeleton|TodaySkeleton|MarketplaceSkeleton|POSSkeleton|KDSSkeleton/;

export type LoadingSkeletonCriticalModule = (typeof LOADING_SKELETON_CRITICAL_MODULES)[number];
export type LoadingSkeletonExceptionModule = (typeof LOADING_SKELETON_EXCEPTION_MODULES)[number];
