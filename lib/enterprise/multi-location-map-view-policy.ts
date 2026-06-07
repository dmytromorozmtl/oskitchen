/**
 * Absolute Final Task 60 — multi-location map view: floor plan editor + location switcher.
 *
 * Network map on enterprise multi-location dashboard with drill-down to per-location
 * floor plan editor.
 *
 * @see components/enterprise/multi-location-map-view.tsx
 * @see components/restaurant/floor-plan-editor.tsx
 * @see components/dashboard/location-switcher.tsx
 */

export const MULTI_LOCATION_MAP_VIEW_POLICY_ID =
  "multi-location-map-view-absolute-final-v1" as const;

export const MULTI_LOCATION_MAP_VIEW_ROUTE = "/dashboard/enterprise/multi-location" as const;

export const MULTI_LOCATION_MAP_VIEW_FLOOR_PLANS_ROUTE = "/dashboard/floor-plans" as const;

export const MULTI_LOCATION_MAP_VIEW_TEST_ID = "multi-location-map-view" as const;

export const MULTI_LOCATION_MAP_CANVAS_TEST_ID = "multi-location-map-canvas" as const;

export const MULTI_LOCATION_MAP_SWITCHER_TEST_ID = "multi-location-map-switcher" as const;

export const MULTI_LOCATION_MAP_PIN_TEST_ID_PREFIX = "multi-location-map-pin-" as const;

export const MULTI_LOCATION_MAP_VIEW_MODULE =
  "components/enterprise/multi-location-map-view.tsx" as const;

export const MULTI_LOCATION_MAP_FLOOR_PLAN_EDITOR_MODULE =
  "components/restaurant/floor-plan-editor.tsx" as const;

export const MULTI_LOCATION_MAP_ENTERPRISE_PANEL_MODULE =
  "components/enterprise/multi-location-enterprise-panel.tsx" as const;

export const MULTI_LOCATION_MAP_VIEW_WIRING_PATHS = [
  "lib/enterprise/multi-location-map-view-policy.ts",
  "lib/enterprise/multi-location-map-view-audit.ts",
  "lib/enterprise/multi-location-map-view-data.ts",
  MULTI_LOCATION_MAP_VIEW_MODULE,
  MULTI_LOCATION_MAP_ENTERPRISE_PANEL_MODULE,
  "app/dashboard/floor-plans/page.tsx",
  "tests/unit/multi-location-map-view.test.ts",
] as const;

export const MULTI_LOCATION_MAP_VIEW_UNIT_TEST =
  "tests/unit/multi-location-map-view.test.ts" as const;

export const MULTI_LOCATION_MAP_VIEW_CI_SCRIPTS = [
  "test:ci:multi-location-map-view",
  "test:ci:multi-location-map-view:cert",
] as const;

export function multiLocationFloorPlanHref(locationId: string): string {
  return `${MULTI_LOCATION_MAP_VIEW_FLOOR_PLANS_ROUTE}?locationId=${encodeURIComponent(locationId)}`;
}

export function multiLocationMapViewHref(locationId?: string | null): string {
  if (!locationId) return MULTI_LOCATION_MAP_VIEW_ROUTE;
  return `${MULTI_LOCATION_MAP_VIEW_ROUTE}?locationId=${encodeURIComponent(locationId)}`;
}
