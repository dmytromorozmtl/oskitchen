/**
 * ENT-63 — Multi-Location Dashboard 2.0 (100+ locations, drill-down, comparison).
 *
 * @see app/dashboard/enterprise/multi-location/page.tsx
 * @see lib/enterprise/multi-location-dashboard-2-builders.ts
 */

export const MULTI_LOCATION_DASHBOARD_2_POLICY_ID = "multi-location-dashboard-2-ent63-v1" as const;

export const MULTI_LOCATION_DASHBOARD_2_PATH = "/dashboard/enterprise/multi-location" as const;

/** Certified capacity — UI paginates beyond 100 locations without choking the shell. */
export const MULTI_LOCATION_DASHBOARD_MAX_LOCATIONS = 500 as const;

/** Enterprise scale threshold — badge + paginated ranking kicks in. */
export const MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD = 100 as const;

export const MULTI_LOCATION_RANK_PAGE_SIZE = 25 as const;

export const MULTI_LOCATION_COMPARISON_TABLE_PAGE_SIZE = 50 as const;

export const MULTI_LOCATION_MAX_ALERTS = 12 as const;
