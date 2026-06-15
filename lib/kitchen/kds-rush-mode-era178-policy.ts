/**
 * Era 178 — KDS Rush Mode wiring cert (Phase 3 Round 2 #30).
 *
 * Full path: peak detection → priority routing → RushMode UI → sound alerts.
 */

import {
  KDS_RUSH_MODE_ERA103_COMPONENT,
  KDS_RUSH_MODE_ERA103_OPS_DOC,
  KDS_RUSH_MODE_ERA103_POLICY_ID,
  KDS_RUSH_MODE_ERA103_RUSH_LEVELS,
  KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT,
  KDS_RUSH_MODE_ERA103_WIRING_PATHS,
} from "@/lib/kitchen/kds-rush-mode-era103-policy";

export const KDS_RUSH_MODE_ERA178_POLICY_ID = "era178-kds-rush-mode-v1" as const;

export const KDS_RUSH_MODE_ERA178_SUMMARY_ARTIFACT =
  "artifacts/kds-rush-mode-era178-smoke-summary.json" as const;

export const KDS_RUSH_MODE_ERA178_NPM_SCRIPT = "smoke:kds-rush-mode-era178" as const;

export const KDS_RUSH_MODE_ERA178_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-rush-mode-era178.ts" as const;

export const KDS_RUSH_MODE_ERA178_OPS_DOC = "docs/kds-rush-mode-era178-setup.md" as const;

export const KDS_RUSH_MODE_ERA178_CANONICAL_OPS_DOC = KDS_RUSH_MODE_ERA103_OPS_DOC;

export const KDS_RUSH_MODE_ERA178_CANONICAL_SUMMARY_ARTIFACT =
  KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT;

export const KDS_RUSH_MODE_ERA178_WIRING_PATHS = KDS_RUSH_MODE_ERA103_WIRING_PATHS;

export const KDS_RUSH_MODE_ERA178_RUSH_LEVELS = KDS_RUSH_MODE_ERA103_RUSH_LEVELS;

export const KDS_RUSH_MODE_ERA178_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen (KDS) — queue 8+ tickets to trigger peak rush.",
  "Verify RushMode banner with peak signals and priority routing cards.",
  "Enable sound — confirm triple-tone alert on peak rush entry.",
  "Run npm run smoke:kds-rush-mode-era103 — canonical era103 wiring cert PASSED.",
  "Run npm run smoke:kds-rush-mode-era178 — artifact overall PASSED.",
] as const;

export const KDS_RUSH_MODE_ERA178_CI_SCRIPTS = [
  "test:ci:kds-rush-mode-era178",
  "test:ci:kds-rush-mode-era178:cert",
] as const;

export const KDS_RUSH_MODE_ERA178_UNIT_TESTS = [
  "tests/unit/kds-rush-mode-era178.test.ts",
  "tests/unit/kds-rush-mode-era103.test.ts",
  "tests/unit/kds-rush-mode.test.ts",
] as const;

export const KDS_RUSH_MODE_ERA178_CANONICAL_POLICY_ID = KDS_RUSH_MODE_ERA103_POLICY_ID;

export const KDS_RUSH_MODE_ERA178_COMPONENT = KDS_RUSH_MODE_ERA103_COMPONENT;

export const KDS_RUSH_MODE_ERA178_CAPABILITIES = [
  "peak_detection",
  "priority_routing",
  "rush_ui",
  "sound_alerts",
] as const;
