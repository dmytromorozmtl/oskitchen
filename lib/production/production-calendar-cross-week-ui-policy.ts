/**
 * Production calendar cross-week UI — Evolution Era 10 Cycle 2.
 *
 * Extends Era 8 week-column move controls with `?week=` navigation and
 * ←/→ moves across week boundaries (still uses `movePlanTaskAction` + RBAC).
 */

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_POLICY_ID =
  "era10-production-calendar-cross-week-ui-v1" as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_EXTENDS_POLICY_ID =
  "era8-production-calendar-move-ui-v1" as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_PAGE_PATH =
  "/dashboard/production/calendar" as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_PAGE_FILE =
  "app/dashboard/production/calendar/page.tsx" as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_NAV_MODULE =
  "lib/production/production-calendar-week-navigation.ts" as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_CI_SCRIPTS = [
  "test:ci:production-calendar-cross-week-ui",
  "test:ci:production-calendar-cross-week-ui:cert",
] as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_UNIT_TESTS = [
  "tests/unit/production-calendar-week-navigation.test.ts",
  "tests/unit/production-calendar-cross-week-ui-policy.test.ts",
  "tests/unit/production-calendar-cross-week-ui-cert-live.test.ts",
] as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_CANONICAL_DOC_PATHS = [
  "docs/implementation-backlog.md",
  "docs/qa-master-test-plan.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const PRODUCTION_CALENDAR_CROSS_WEEK_UI_CANONICAL_MARKERS = [
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_POLICY_ID,
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_EXTENDS_POLICY_ID,
  "cross-week",
] as const;

export function productionCalendarPageWiresCrossWeekNavigation(pageSource: string): boolean {
  return (
    pageSource.includes("parseProductionCalendarWeekStart") &&
    pageSource.includes("productionCalendarWeekHref") &&
    pageSource.includes("adjacentProductionPlanDateIso") &&
    pageSource.includes("Previous week") &&
    pageSource.includes("Next week")
  );
}
