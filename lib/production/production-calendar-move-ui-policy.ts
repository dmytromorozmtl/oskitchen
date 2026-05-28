/**
 * Production calendar move-task UI policy — Evolution Era 8 Cycle 4.
 *
 * `movePlanTaskAction` was server-certified (RBAC + form deny) but had no UI.
 * Week-column ←/→ controls expose reschedule within the visible week only.
 */

export const PRODUCTION_CALENDAR_MOVE_UI_POLICY_ID =
  "era8-production-calendar-move-ui-v1" as const;

export const PRODUCTION_CALENDAR_MOVE_UI_EXTENDS_POLICY_ID =
  "era6-production-calendar-form-deny-v1" as const;

export const PRODUCTION_CALENDAR_MOVE_UI_PAGE_PATH =
  "/dashboard/production/calendar" as const;

export const PRODUCTION_CALENDAR_MOVE_UI_PAGE_FILE =
  "app/dashboard/production/calendar/page.tsx" as const;

export const PRODUCTION_CALENDAR_MOVE_ACTION_NAME = "movePlanTaskAction" as const;

export const PRODUCTION_CALENDAR_MOVE_FORM_FIELDS = ["taskId", "planDate"] as const;

export const PRODUCTION_CALENDAR_MOVE_UI_CI_SCRIPTS = [
  "test:ci:production-calendar-move-ui",
  "test:ci:production-calendar-move-ui:cert",
] as const;

export const PRODUCTION_CALENDAR_MOVE_UI_UNIT_TESTS = [
  "tests/unit/production-calendar-move-ui-policy.test.ts",
  "tests/unit/production-calendar-move-ui-ci-live.test.ts",
] as const;

export const PRODUCTION_CALENDAR_MOVE_UI_CANONICAL_DOC_PATHS = [
  "docs/implementation-backlog.md",
  "docs/qa-master-test-plan.md",
] as const;

export const PRODUCTION_CALENDAR_MOVE_UI_CANONICAL_MARKERS = [
  PRODUCTION_CALENDAR_MOVE_UI_POLICY_ID,
  "move-task",
] as const;

/**
 * Returns true when the calendar page wires move forms with required hidden fields.
 */
export function productionCalendarPageWiresMoveTaskAction(pageSource: string): boolean {
  if (!pageSource.includes(PRODUCTION_CALENDAR_MOVE_ACTION_NAME)) return false;
  return PRODUCTION_CALENDAR_MOVE_FORM_FIELDS.every((field) =>
    pageSource.includes(`name="${field}"`),
  );
}
