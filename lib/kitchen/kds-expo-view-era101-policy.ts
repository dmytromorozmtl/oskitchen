/**
 * Era 101 — KDS Expo View wiring cert (Phase 3 extension #101).
 *
 * Full path: order tickets → ready / waiting / delayed lanes → expo handoff UI.
 */

export const KDS_EXPO_VIEW_ERA101_POLICY_ID = "era101-kds-expo-view-v1" as const;

export const KDS_EXPO_VIEW_ERA101_SUMMARY_ARTIFACT =
  "artifacts/kds-expo-view-smoke-summary.json" as const;

export const KDS_EXPO_VIEW_ERA101_NPM_SCRIPT = "smoke:kds-expo-view-era101" as const;

export const KDS_EXPO_VIEW_ERA101_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-expo-view-era101.ts" as const;

export const KDS_EXPO_VIEW_ERA101_OPS_DOC = "docs/kds-expo-view-era101-setup.md" as const;

export const KDS_EXPO_VIEW_ERA101_WIRING_PATHS = [
  "app/dashboard/kitchen/expo/page.tsx",
  "components/kitchen/expo-view-client.tsx",
  "lib/kitchen/kds-expo-view.ts",
  "lib/kitchen/kds-expo-view-policy.ts",
  "services/kitchen/expo-view-service.ts",
] as const;

export const KDS_EXPO_VIEW_ERA101_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Expo — verify ready, waiting, delayed lane headers.",
  "Bump orders on KDS — confirm ready tickets move to the Ready lane.",
  "Let tickets exceed overdue threshold — verify Delayed lane highlights them.",
  "Run npm run smoke:kds-expo-view-era101 — artifact overall PASSED.",
] as const;

export const KDS_EXPO_VIEW_ERA101_CI_SCRIPTS = [
  "test:ci:kds-expo-view-era101",
  "test:ci:kds-expo-view-era101:cert",
] as const;

export const KDS_EXPO_VIEW_ERA101_UNIT_TESTS = [
  "tests/unit/kds-expo-view-era101.test.ts",
  "tests/unit/kds-expo-view.test.ts",
] as const;

export const KDS_EXPO_VIEW_ERA101_ROUTE = "/dashboard/kitchen/expo" as const;

export const KDS_EXPO_VIEW_ERA101_LANES = ["ready", "waiting", "delayed"] as const;
