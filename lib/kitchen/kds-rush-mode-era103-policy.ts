/**
 * Era 103 — KDS Rush Mode wiring cert (Phase 3 extension #103).
 *
 * Full path: peak detection → priority routing → RushMode UI → sound alerts.
 */

export const KDS_RUSH_MODE_ERA103_POLICY_ID = "era103-kds-rush-mode-v1" as const;

export const KDS_RUSH_MODE_ERA103_SUMMARY_ARTIFACT =
  "artifacts/kds-rush-mode-smoke-summary.json" as const;

export const KDS_RUSH_MODE_ERA103_NPM_SCRIPT = "smoke:kds-rush-mode-era103" as const;

export const KDS_RUSH_MODE_ERA103_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-rush-mode-era103.ts" as const;

export const KDS_RUSH_MODE_ERA103_OPS_DOC = "docs/kds-rush-mode-era103-setup.md" as const;

export const KDS_RUSH_MODE_ERA103_WIRING_PATHS = [
  "components/kitchen/rush-mode.tsx",
  "lib/kitchen/kds-rush-mode.ts",
  "lib/kitchen/kds-rush-mode-policy.ts",
  "lib/kitchen/kds-realtime-sounds.ts",
  "components/kitchen/kds-daily-service.tsx",
] as const;

export const KDS_RUSH_MODE_ERA103_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen (KDS) — queue 8+ tickets to trigger peak rush.",
  "Verify RushMode banner with peak signals and priority routing cards.",
  "Enable sound — confirm triple-tone alert on peak rush entry.",
  "Run npm run smoke:kds-rush-mode-era103 — artifact overall PASSED.",
] as const;

export const KDS_RUSH_MODE_ERA103_CI_SCRIPTS = [
  "test:ci:kds-rush-mode-era103",
  "test:ci:kds-rush-mode-era103:cert",
] as const;

export const KDS_RUSH_MODE_ERA103_UNIT_TESTS = [
  "tests/unit/kds-rush-mode-era103.test.ts",
  "tests/unit/kds-rush-mode.test.ts",
] as const;

export const KDS_RUSH_MODE_ERA103_COMPONENT = "components/kitchen/rush-mode.tsx" as const;

export const KDS_RUSH_MODE_ERA103_RUSH_LEVELS = ["normal", "building", "rush"] as const;
