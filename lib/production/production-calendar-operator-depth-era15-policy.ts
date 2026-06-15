/**
 * Production calendar operator depth Era 15 recertification — Evolution Era 15 Cycle 5.
 *
 * Re-validates Era 6/8/10/13 production calendar operator scope after Era 14/15 cycles.
 * Does not add drag-and-drop, KDS sync, delete-task UI, or rush-hour certification.
 */

import {
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_ACTIONS,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_HONEST_SCOPE,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_IN_DEFAULT_CI,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_MANUAL_CHECKLIST,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PAGE_FILE,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PAGE_PATH,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PERMISSION,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_SMOKE_NPM_SCRIPT,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_SMOKE_SCRIPT,
} from "@/lib/production/production-calendar-operator-depth-era13-policy";

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID =
  "era15-production-calendar-operator-recert-v1" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_EXTENDS_POLICIES = [
  "era6-production-calendar-form-deny-v1",
  "era8-production-calendar-move-ui-v1",
  "era10-production-calendar-cross-week-ui-v1",
  "era10-production-calendar-status-workflow-ui-v1",
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_POLICY_ID,
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_PAGE_PATH =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PAGE_PATH;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_PAGE_FILE =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PAGE_FILE;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_PERMISSION =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_PERMISSION;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_ACTIONS =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_ACTIONS;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_HONEST_SCOPE =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_HONEST_SCOPE;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_IN_DEFAULT_CI =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_IN_DEFAULT_CI;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_MANUAL_CHECKLIST = [
  ...PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_MANUAL_CHECKLIST,
  "Run npm run smoke:production-calendar before pilot sign-off (CI certs only — complete manual steps above on staging).",
  "Do not claim drag-and-drop, KDS sync, delete-task UI, or rush-hour production certification.",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_OPS_DOC =
  "docs/production-calendar-operator-checklist.md" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_SMOKE_SCRIPT =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_SMOKE_SCRIPT;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_SMOKE_NPM_SCRIPT =
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_SMOKE_NPM_SCRIPT;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CI_SCRIPTS = [
  "test:ci:production-calendar-operator-depth-era15",
  "test:ci:production-calendar-operator-depth-era15:cert",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_UNIT_TESTS = [
  "tests/unit/production-calendar-operator-depth-era15-policy.test.ts",
  "tests/unit/production-calendar-operator-depth-era15-cert-live.test.ts",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CANONICAL_DOC_PATHS = [
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_OPS_DOC,
  "docs/feature-maturity-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CANONICAL_MARKERS = [
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA13_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_PAGE_PATH,
  "production.manage",
  "Drag-and-drop",
  "not rush-hour",
] as const;
