/**
 * Production calendar status workflow UI — Evolution Era 10 Cycle 3.
 *
 * Exposes `updatePlanTaskStatusAction` on the calendar page for SCHEDULED /
 * IN_PROGRESS / COMPLETED transitions (RBAC + form deny unchanged).
 */

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_POLICY_ID =
  "era10-production-calendar-status-workflow-ui-v1" as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_EXTENDS_POLICY_ID =
  "era10-production-calendar-cross-week-ui-v1" as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_PAGE_PATH =
  "/dashboard/production/calendar" as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_PAGE_FILE =
  "app/dashboard/production/calendar/page.tsx" as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_ACTION_NAME =
  "updatePlanTaskStatusAction" as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_FORM_FIELDS = [
  "taskId",
  "status",
] as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_STATUS_MODULE =
  "lib/production/production-plan-task-status.ts" as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_CI_SCRIPTS = [
  "test:ci:production-calendar-status-workflow-ui",
  "test:ci:production-calendar-status-workflow-ui:cert",
] as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_UNIT_TESTS = [
  "tests/unit/production-plan-task-status.test.ts",
  "tests/unit/production-calendar-status-workflow-ui-policy.test.ts",
  "tests/unit/production-calendar-status-workflow-ui-cert-live.test.ts",
] as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_CANONICAL_DOC_PATHS = [
  "docs/implementation-backlog.md",
  "docs/qa-master-test-plan.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_CANONICAL_MARKERS = [
  PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_POLICY_ID,
  PRODUCTION_CALENDAR_STATUS_WORKFLOW_UI_EXTENDS_POLICY_ID,
  "status workflow",
] as const;

export function productionCalendarPageWiresStatusWorkflow(pageSource: string): boolean {
  if (!pageSource.includes(PRODUCTION_CALENDAR_STATUS_WORKFLOW_ACTION_NAME)) return false;
  if (!pageSource.includes("PRODUCTION_PLAN_TASK_STATUSES")) return false;
  return PRODUCTION_CALENDAR_STATUS_WORKFLOW_FORM_FIELDS.every((field) =>
    pageSource.includes(`name="${field}"`),
  );
}
