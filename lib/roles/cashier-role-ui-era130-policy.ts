/**
 * Era 130 — Cashier Role UI wiring cert (Phase 8 #57).
 *
 * Full path: register KPIs → cashier briefing → checkout shortcuts.
 */

import {
  CASHIER_ROLE_UI_PATH,
  CASHIER_ROLE_UI_POLICY_ID,
  CASHIER_ROLE_UI_SERVICE,
} from "@/lib/roles/cashier-ui-policy";

export const CASHIER_ROLE_UI_ERA130_POLICY_ID = "era130-role-ui-cashier-v1" as const;

export const CASHIER_ROLE_UI_ERA130_SUMMARY_ARTIFACT =
  "artifacts/cashier-role-ui-smoke-summary.json" as const;

export const CASHIER_ROLE_UI_ERA130_NPM_SCRIPT = "smoke:cashier-role-ui-era130" as const;

export const CASHIER_ROLE_UI_ERA130_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-cashier-role-ui-era130.ts" as const;

export const CASHIER_ROLE_UI_ERA130_OPS_DOC = "docs/cashier-role-ui-era130-setup.md" as const;

export const CASHIER_ROLE_UI_ERA130_WIRING_PATHS = [
  CASHIER_ROLE_UI_SERVICE,
  "lib/roles/cashier-ui-builders.ts",
  "lib/roles/cashier-ui-policy.ts",
  "app/dashboard/roles/cashier/page.tsx",
  "components/roles/cashier-role-panel.tsx",
] as const;

export const CASHIER_ROLE_UI_ERA130_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Roles → Cashier.",
  "Review cashier command center — readiness, register KPIs, next action.",
  "Inspect priority tiles and top actions from cashier briefing pack.",
  "Use cashier shortcuts — POS terminal, tablet, mobile, cash management.",
  "Run npm run smoke:cashier-role-ui-era130 — artifact overall PASSED.",
] as const;

export const CASHIER_ROLE_UI_ERA130_CI_SCRIPTS = [
  "test:ci:cashier-role-ui-era130",
  "test:ci:cashier-role-ui-era130:cert",
] as const;

export const CASHIER_ROLE_UI_ERA130_UNIT_TESTS = [
  "tests/unit/cashier-role-ui-era130.test.ts",
  "tests/unit/cashier-role-ui.test.ts",
] as const;

export const CASHIER_ROLE_UI_ERA130_CANONICAL_POLICY_ID = CASHIER_ROLE_UI_POLICY_ID;

export const CASHIER_ROLE_UI_ERA130_SERVICE = CASHIER_ROLE_UI_SERVICE;

export const CASHIER_ROLE_UI_ERA130_ROUTE = CASHIER_ROLE_UI_PATH;

export const CASHIER_ROLE_UI_ERA130_SECTIONS = [
  "kpis",
  "briefing",
  "shortcuts",
] as const;
