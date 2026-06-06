/**
 * Era 134 — Dark Mode Everywhere wiring cert (Phase 8 #61).
 *
 * Full path: shell consistency → all role UIs → leadership surfaces.
 */

import {
  DARK_MODE_EVERYWHERE_POLICY_ID,
  DARK_MODE_EVERYWHERE_MODULES,
  DARK_MODE_EVERYWHERE_ROLE_MODULES,
} from "@/lib/design/dark-mode-everywhere-policy";

export const DARK_MODE_EVERYWHERE_ERA134_POLICY_ID = "era134-dark-mode-everywhere-v1" as const;

export const DARK_MODE_EVERYWHERE_ERA134_SUMMARY_ARTIFACT =
  "artifacts/dark-mode-everywhere-smoke-summary.json" as const;

export const DARK_MODE_EVERYWHERE_ERA134_NPM_SCRIPT = "smoke:dark-mode-everywhere-era134" as const;

export const DARK_MODE_EVERYWHERE_ERA134_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-dark-mode-everywhere-era134.ts" as const;

export const DARK_MODE_EVERYWHERE_ERA134_OPS_DOC = "docs/dark-mode-everywhere-era134-setup.md" as const;

export const DARK_MODE_EVERYWHERE_ERA134_SERVICE =
  "services/design/dark-mode-everywhere-service.ts" as const;

export const DARK_MODE_EVERYWHERE_ERA134_WIRING_PATHS = [
  DARK_MODE_EVERYWHERE_ERA134_SERVICE,
  "lib/design/dark-mode-everywhere-policy.ts",
  "lib/design/dark-mode-everywhere-patterns.ts",
  "lib/design/dark-mode-everywhere-audit-policy.ts",
  "components/roles/owner-role-panel.tsx",
] as const;

export const DARK_MODE_EVERYWHERE_ERA134_CYCLE_RUNBOOK_STEPS = [
  "Toggle system theme to dark — open Dashboard shell and verify token-based chrome.",
  "Visit all five role UIs — owner, manager, chef, cashier, driver — no light-only cards.",
  "Open Command Center, Analytics Suite, Data Export — leadership surfaces render in dark.",
  "Run npm run test:ci:dark-mode-everywhere-era134 — all audited modules PASS.",
  "Run npm run smoke:dark-mode-everywhere-era134 — artifact overall PASSED.",
] as const;

export const DARK_MODE_EVERYWHERE_ERA134_CI_SCRIPTS = [
  "test:ci:dark-mode-everywhere-era134",
  "test:ci:dark-mode-everywhere-era134:cert",
] as const;

export const DARK_MODE_EVERYWHERE_ERA134_UNIT_TESTS = [
  "tests/unit/dark-mode-everywhere-era134.test.ts",
  "tests/unit/dark-mode-everywhere-policy.test.ts",
] as const;

export const DARK_MODE_EVERYWHERE_ERA134_CANONICAL_POLICY_ID = DARK_MODE_EVERYWHERE_POLICY_ID;

export const DARK_MODE_EVERYWHERE_ERA134_AUDITED_MODULES = DARK_MODE_EVERYWHERE_MODULES;

export const DARK_MODE_EVERYWHERE_ERA134_ROLE_MODULES = DARK_MODE_EVERYWHERE_ROLE_MODULES;

export const DARK_MODE_EVERYWHERE_ERA134_SURFACES = [
  "shell",
  "roles",
  "leadership",
] as const;
