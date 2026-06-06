/**
 * Era 128 — Manager Role UI wiring cert (Phase 8 #55).
 *
 * Full path: operational KPIs → shift briefing → manager shortcuts.
 */

import {
  MANAGER_ROLE_UI_PATH,
  MANAGER_ROLE_UI_POLICY_ID,
  MANAGER_ROLE_UI_SERVICE,
} from "@/lib/roles/manager-ui-policy";

export const MANAGER_ROLE_UI_ERA128_POLICY_ID = "era128-role-ui-manager-v1" as const;

export const MANAGER_ROLE_UI_ERA128_SUMMARY_ARTIFACT =
  "artifacts/manager-role-ui-smoke-summary.json" as const;

export const MANAGER_ROLE_UI_ERA128_NPM_SCRIPT = "smoke:manager-role-ui-era128" as const;

export const MANAGER_ROLE_UI_ERA128_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-manager-role-ui-era128.ts" as const;

export const MANAGER_ROLE_UI_ERA128_OPS_DOC = "docs/manager-role-ui-era128-setup.md" as const;

export const MANAGER_ROLE_UI_ERA128_WIRING_PATHS = [
  MANAGER_ROLE_UI_SERVICE,
  "lib/roles/manager-ui-builders.ts",
  "lib/roles/manager-ui-policy.ts",
  "app/dashboard/roles/manager/page.tsx",
  "components/roles/manager-role-panel.tsx",
] as const;

export const MANAGER_ROLE_UI_ERA128_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Roles → Manager.",
  "Review manager command center — readiness, operational KPIs, next action.",
  "Inspect priority tiles and top actions from manager briefing pack.",
  "Use manager shortcuts — KDS manager, today, packing, labor.",
  "Run npm run smoke:manager-role-ui-era128 — artifact overall PASSED.",
] as const;

export const MANAGER_ROLE_UI_ERA128_CI_SCRIPTS = [
  "test:ci:manager-role-ui-era128",
  "test:ci:manager-role-ui-era128:cert",
] as const;

export const MANAGER_ROLE_UI_ERA128_UNIT_TESTS = [
  "tests/unit/manager-role-ui-era128.test.ts",
  "tests/unit/manager-role-ui.test.ts",
] as const;

export const MANAGER_ROLE_UI_ERA128_CANONICAL_POLICY_ID = MANAGER_ROLE_UI_POLICY_ID;

export const MANAGER_ROLE_UI_ERA128_SERVICE = MANAGER_ROLE_UI_SERVICE;

export const MANAGER_ROLE_UI_ERA128_ROUTE = MANAGER_ROLE_UI_PATH;

export const MANAGER_ROLE_UI_ERA128_SECTIONS = [
  "kpis",
  "briefing",
  "shortcuts",
] as const;
