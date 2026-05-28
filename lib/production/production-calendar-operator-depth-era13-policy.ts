/**
 * Production calendar operator depth — Evolution Era 13 Cycle 4.
 *
 * Consolidates Era 6–11 production calendar policies into one honest operator
 * scope and pilot manual checklist. Does not add drag-and-drop, KDS sync, or
 * delete-task UI.
 */

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_POLICY_ID =
  "era13-production-calendar-operator-depth-v1" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_EXTENDS_POLICIES = [
  "era6-production-calendar-form-deny-v1",
  "era8-production-calendar-move-ui-v1",
  "era10-production-calendar-cross-week-ui-v1",
  "era10-production-calendar-status-workflow-ui-v1",
  "era11-mutation-access-recert-v1",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PAGE_PATH =
  "/dashboard/production/calendar" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PAGE_FILE =
  "app/dashboard/production/calendar/page.tsx" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PERMISSION = "production.manage" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_ACTIONS = [
  "createPlanTaskAction",
  "movePlanTaskAction",
  "updatePlanTaskStatusAction",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_SMOKE_SCRIPT =
  "scripts/smoke-production-calendar-operator.ts" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_SMOKE_NPM_SCRIPT =
  "smoke:production-calendar" as const;

/** Staging/pilot manual only — not in default `ci.yml`. */
export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_IN_DEFAULT_CI = false as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_HONEST_SCOPE = {
  notInDefaultCi: true,
  notDragAndDrop: true,
  notKdsKitchenSync: true,
  notDeleteTaskUi: true,
  notRushHourProductionCertified: true,
  pilotReadyQualified: true,
} as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_MANUAL_CHECKLIST = [
  "Sign in as a workspace user with production.manage (or owner).",
  "Open /dashboard/production/calendar — confirm week label and prev/this/next week links.",
  "Add batch task — title + plan date + optional batch size; confirm task appears on the day column.",
  "Reschedule within week — use ←/→ on a task; confirm plan date moves one day.",
  "Cross-week — on Monday task use ← or Sunday task use →; confirm week query changes and task moves.",
  "Status workflow — set task to IN_PROGRESS then COMPLETED via per-task control; confirm card styling updates.",
  "RBAC deny — sign in as staff without production.manage; submit create/move/status; confirm form deny banner (no silent success).",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_CI_SCRIPTS = [
  "test:ci:production-calendar-operator-depth-era13",
  "test:ci:production-calendar-operator-depth-era13:cert",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_CERT_CHAIN_SCRIPTS = [
  "test:ci:production-calendar-move-ui:cert",
  "test:ci:production-calendar-operator-depth-era13:cert",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_UNIT_TESTS = [
  "tests/unit/production-calendar-operator-depth-era13-policy.test.ts",
  "tests/unit/production-calendar-operator-depth-era13-cert-live.test.ts",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_CANONICAL_DOC_PATHS = [
  "docs/production-calendar-operator-checklist.md",
  "docs/feature-maturity-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_CANONICAL_MARKERS = [
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PAGE_PATH,
  "production.manage",
  "Drag-and-drop",
  "KDS / kitchen board sync",
] as const;
