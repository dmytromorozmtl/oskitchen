/**
 * Era 127 — Owner Role UI wiring cert (Phase 8 #54).
 *
 * Full path: leadership KPIs → briefing priorities → owner shortcuts.
 */

import {
  OWNER_ROLE_UI_PATH,
  OWNER_ROLE_UI_POLICY_ID,
  OWNER_ROLE_UI_SERVICE,
} from "@/lib/roles/owner-ui-policy";

export const OWNER_ROLE_UI_ERA127_POLICY_ID = "era127-role-ui-owner-v1" as const;

export const OWNER_ROLE_UI_ERA127_SUMMARY_ARTIFACT =
  "artifacts/owner-role-ui-smoke-summary.json" as const;

export const OWNER_ROLE_UI_ERA127_NPM_SCRIPT = "smoke:owner-role-ui-era127" as const;

export const OWNER_ROLE_UI_ERA127_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-owner-role-ui-era127.ts" as const;

export const OWNER_ROLE_UI_ERA127_OPS_DOC = "docs/owner-role-ui-era127-setup.md" as const;

export const OWNER_ROLE_UI_ERA127_WIRING_PATHS = [
  OWNER_ROLE_UI_SERVICE,
  "lib/roles/owner-ui-builders.ts",
  "lib/roles/owner-ui-policy.ts",
  "app/dashboard/roles/owner/page.tsx",
  "components/roles/owner-role-panel.tsx",
] as const;

export const OWNER_ROLE_UI_ERA127_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Roles → Owner.",
  "Review owner command center — readiness, KPIs, next action.",
  "Inspect priority tiles and top actions from owner briefing pack.",
  "Use owner shortcuts — executive, analytics suite, integration health.",
  "Run npm run smoke:owner-role-ui-era127 — artifact overall PASSED.",
] as const;

export const OWNER_ROLE_UI_ERA127_CI_SCRIPTS = [
  "test:ci:owner-role-ui-era127",
  "test:ci:owner-role-ui-era127:cert",
] as const;

export const OWNER_ROLE_UI_ERA127_UNIT_TESTS = [
  "tests/unit/owner-role-ui-era127.test.ts",
  "tests/unit/owner-role-ui.test.ts",
] as const;

export const OWNER_ROLE_UI_ERA127_CANONICAL_POLICY_ID = OWNER_ROLE_UI_POLICY_ID;

export const OWNER_ROLE_UI_ERA127_SERVICE = OWNER_ROLE_UI_SERVICE;

export const OWNER_ROLE_UI_ERA127_ROUTE = OWNER_ROLE_UI_PATH;

export const OWNER_ROLE_UI_ERA127_SECTIONS = [
  "kpis",
  "briefing",
  "shortcuts",
] as const;
