/**
 * Era 129 — Chef Role UI wiring cert (Phase 8 #56).
 *
 * Full path: line KPIs → kitchen briefing → chef shortcuts.
 */

import {
  CHEF_ROLE_UI_PATH,
  CHEF_ROLE_UI_POLICY_ID,
  CHEF_ROLE_UI_SERVICE,
} from "@/lib/roles/chef-ui-policy";

export const CHEF_ROLE_UI_ERA129_POLICY_ID = "era129-role-ui-chef-v1" as const;

export const CHEF_ROLE_UI_ERA129_SUMMARY_ARTIFACT =
  "artifacts/chef-role-ui-smoke-summary.json" as const;

export const CHEF_ROLE_UI_ERA129_NPM_SCRIPT = "smoke:chef-role-ui-era129" as const;

export const CHEF_ROLE_UI_ERA129_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-chef-role-ui-era129.ts" as const;

export const CHEF_ROLE_UI_ERA129_OPS_DOC = "docs/chef-role-ui-era129-setup.md" as const;

export const CHEF_ROLE_UI_ERA129_WIRING_PATHS = [
  CHEF_ROLE_UI_SERVICE,
  "lib/roles/chef-ui-builders.ts",
  "lib/roles/chef-ui-policy.ts",
  "app/dashboard/roles/chef/page.tsx",
  "components/roles/chef-role-panel.tsx",
] as const;

export const CHEF_ROLE_UI_ERA129_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Roles → Chef.",
  "Review chef command center — readiness, line KPIs, next action.",
  "Inspect priority tiles and top actions from kitchen briefing pack.",
  "Use chef shortcuts — KDS, production, expo, kitchen tablet.",
  "Run npm run smoke:chef-role-ui-era129 — artifact overall PASSED.",
] as const;

export const CHEF_ROLE_UI_ERA129_CI_SCRIPTS = [
  "test:ci:chef-role-ui-era129",
  "test:ci:chef-role-ui-era129:cert",
] as const;

export const CHEF_ROLE_UI_ERA129_UNIT_TESTS = [
  "tests/unit/chef-role-ui-era129.test.ts",
  "tests/unit/chef-role-ui.test.ts",
] as const;

export const CHEF_ROLE_UI_ERA129_CANONICAL_POLICY_ID = CHEF_ROLE_UI_POLICY_ID;

export const CHEF_ROLE_UI_ERA129_SERVICE = CHEF_ROLE_UI_SERVICE;

export const CHEF_ROLE_UI_ERA129_ROUTE = CHEF_ROLE_UI_PATH;

export const CHEF_ROLE_UI_ERA129_SECTIONS = [
  "kpis",
  "briefing",
  "shortcuts",
] as const;
