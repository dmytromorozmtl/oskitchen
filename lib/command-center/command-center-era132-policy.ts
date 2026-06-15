/**
 * Era 132 — Command Center wiring cert (Phase 8 #59).
 *
 * Full path: market → ops → live → forecast → roles terminal lanes.
 */

import {
  COMMAND_CENTER_LANE_IDS,
  COMMAND_CENTER_PATH,
  COMMAND_CENTER_POLICY_ID,
  COMMAND_CENTER_SERVICE,
} from "@/lib/command-center/command-center-policy";

export const COMMAND_CENTER_ERA132_POLICY_ID = "era132-command-center-v1" as const;

export const COMMAND_CENTER_ERA132_SUMMARY_ARTIFACT =
  "artifacts/command-center-smoke-summary.json" as const;

export const COMMAND_CENTER_ERA132_NPM_SCRIPT = "smoke:command-center-era132" as const;

export const COMMAND_CENTER_ERA132_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-command-center-era132.ts" as const;

export const COMMAND_CENTER_ERA132_OPS_DOC = "docs/command-center-era132-setup.md" as const;

export const COMMAND_CENTER_ERA132_WIRING_PATHS = [
  COMMAND_CENTER_SERVICE,
  "lib/command-center/command-center-builders.ts",
  "lib/command-center/command-center-policy.ts",
  "app/dashboard/command-center/page.tsx",
  "components/command-center/command-center-panel.tsx",
] as const;

export const COMMAND_CENTER_ERA132_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Command Center (owner/leadership access).",
  "Review OS Kitchen Terminal — workspace label, range, ticker count.",
  "Scan five lanes — MARKET, OPS, LIVE, FCST, ROLES.",
  "Inspect ALERTS section — blockers, executive warnings, forecast notes.",
  "Run npm run smoke:command-center-era132 — artifact overall PASSED.",
] as const;

export const COMMAND_CENTER_ERA132_CI_SCRIPTS = [
  "test:ci:command-center-era132",
  "test:ci:command-center-era132:cert",
] as const;

export const COMMAND_CENTER_ERA132_UNIT_TESTS = [
  "tests/unit/command-center-era132.test.ts",
  "tests/unit/command-center.test.ts",
] as const;

export const COMMAND_CENTER_ERA132_CANONICAL_POLICY_ID = COMMAND_CENTER_POLICY_ID;

export const COMMAND_CENTER_ERA132_SERVICE = COMMAND_CENTER_SERVICE;

export const COMMAND_CENTER_ERA132_ROUTE = COMMAND_CENTER_PATH;

export const COMMAND_CENTER_ERA132_LANES = COMMAND_CENTER_LANE_IDS;
