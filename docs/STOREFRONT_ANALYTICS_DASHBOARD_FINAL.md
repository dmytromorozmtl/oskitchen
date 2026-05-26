# Storefront analytics dashboard (final)

**Implemented:** `app/dashboard/storefront/analytics/page.tsx`, `services/storefront/storefront-analytics-report-service.ts`, `app/api/storefront/analytics/route.ts` (ingest).

**Works:** Visits, conversion events, funnel components, test-order exclusion when `analyticsExcludeTestOrders` is true on rollups.

**Limits:** High-volume truncation limits inside report service (existing `take` caps).

**Config:** Storefront enabled + published for public ingest.

**QA:** Toggle test exclusion → revenue count changes appropriately.

**Roadmap:** Sampling for very large tenants.
