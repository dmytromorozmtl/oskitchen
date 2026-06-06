/**
 * Era 131 — Driver Role UI wiring cert (Phase 8 #58).
 *
 * Full path: route KPIs → delivery signals → dispatch shortcuts.
 */

import {
  DRIVER_ROLE_UI_PATH,
  DRIVER_ROLE_UI_POLICY_ID,
  DRIVER_ROLE_UI_SERVICE,
} from "@/lib/roles/driver-ui-policy";

export const DRIVER_ROLE_UI_ERA131_POLICY_ID = "era131-role-ui-driver-v1" as const;

export const DRIVER_ROLE_UI_ERA131_SUMMARY_ARTIFACT =
  "artifacts/driver-role-ui-smoke-summary.json" as const;

export const DRIVER_ROLE_UI_ERA131_NPM_SCRIPT = "smoke:driver-role-ui-era131" as const;

export const DRIVER_ROLE_UI_ERA131_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-driver-role-ui-era131.ts" as const;

export const DRIVER_ROLE_UI_ERA131_OPS_DOC = "docs/driver-role-ui-era131-setup.md" as const;

export const DRIVER_ROLE_UI_ERA131_WIRING_PATHS = [
  DRIVER_ROLE_UI_SERVICE,
  "lib/roles/driver-ui-builders.ts",
  "lib/roles/driver-ui-policy.ts",
  "app/dashboard/roles/driver/page.tsx",
  "components/roles/driver-role-panel.tsx",
] as const;

export const DRIVER_ROLE_UI_ERA131_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Roles → Driver.",
  "Review driver command center — readiness, route KPIs, next action.",
  "Inspect priority tiles and top actions from delivery signals.",
  "Use driver shortcuts — today's route, fleet map, packing, driver mode.",
  "Run npm run smoke:driver-role-ui-era131 — artifact overall PASSED.",
] as const;

export const DRIVER_ROLE_UI_ERA131_CI_SCRIPTS = [
  "test:ci:driver-role-ui-era131",
  "test:ci:driver-role-ui-era131:cert",
] as const;

export const DRIVER_ROLE_UI_ERA131_UNIT_TESTS = [
  "tests/unit/driver-role-ui-era131.test.ts",
  "tests/unit/driver-role-ui.test.ts",
] as const;

export const DRIVER_ROLE_UI_ERA131_CANONICAL_POLICY_ID = DRIVER_ROLE_UI_POLICY_ID;

export const DRIVER_ROLE_UI_ERA131_SERVICE = DRIVER_ROLE_UI_SERVICE;

export const DRIVER_ROLE_UI_ERA131_ROUTE = DRIVER_ROLE_UI_PATH;

export const DRIVER_ROLE_UI_ERA131_SECTIONS = [
  "kpis",
  "briefing",
  "shortcuts",
] as const;
