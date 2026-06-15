/**
 * Era 176 — KDS Expo View wiring cert (Phase 3 Round 2 #28).
 *
 * Full path: order tickets → ready / waiting / delayed lanes → expo handoff UI.
 */

import {
  KDS_EXPO_VIEW_ERA101_LANES,
  KDS_EXPO_VIEW_ERA101_OPS_DOC,
  KDS_EXPO_VIEW_ERA101_POLICY_ID,
  KDS_EXPO_VIEW_ERA101_ROUTE,
  KDS_EXPO_VIEW_ERA101_SUMMARY_ARTIFACT,
  KDS_EXPO_VIEW_ERA101_WIRING_PATHS,
} from "@/lib/kitchen/kds-expo-view-era101-policy";

export const KDS_EXPO_VIEW_ERA176_POLICY_ID = "era176-kds-expo-view-v1" as const;

export const KDS_EXPO_VIEW_ERA176_SUMMARY_ARTIFACT =
  "artifacts/kds-expo-view-era176-smoke-summary.json" as const;

export const KDS_EXPO_VIEW_ERA176_NPM_SCRIPT = "smoke:kds-expo-view-era176" as const;

export const KDS_EXPO_VIEW_ERA176_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-expo-view-era176.ts" as const;

export const KDS_EXPO_VIEW_ERA176_OPS_DOC = "docs/kds-expo-view-era176-setup.md" as const;

export const KDS_EXPO_VIEW_ERA176_CANONICAL_OPS_DOC = KDS_EXPO_VIEW_ERA101_OPS_DOC;

export const KDS_EXPO_VIEW_ERA176_CANONICAL_SUMMARY_ARTIFACT =
  KDS_EXPO_VIEW_ERA101_SUMMARY_ARTIFACT;

export const KDS_EXPO_VIEW_ERA176_WIRING_PATHS = KDS_EXPO_VIEW_ERA101_WIRING_PATHS;

export const KDS_EXPO_VIEW_ERA176_LANES = KDS_EXPO_VIEW_ERA101_LANES;

export const KDS_EXPO_VIEW_ERA176_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Expo — verify ready, waiting, delayed lane headers.",
  "Bump orders on KDS — confirm ready tickets move to the Ready lane.",
  "Let tickets exceed overdue threshold — verify Delayed lane highlights them.",
  "Run npm run smoke:kds-expo-view-era101 — canonical era101 wiring cert PASSED.",
  "Run npm run smoke:kds-expo-view-era176 — artifact overall PASSED.",
] as const;

export const KDS_EXPO_VIEW_ERA176_CI_SCRIPTS = [
  "test:ci:kds-expo-view-era176",
  "test:ci:kds-expo-view-era176:cert",
] as const;

export const KDS_EXPO_VIEW_ERA176_UNIT_TESTS = [
  "tests/unit/kds-expo-view-era176.test.ts",
  "tests/unit/kds-expo-view-era101.test.ts",
  "tests/unit/kds-expo-view.test.ts",
] as const;

export const KDS_EXPO_VIEW_ERA176_CANONICAL_POLICY_ID = KDS_EXPO_VIEW_ERA101_POLICY_ID;

export const KDS_EXPO_VIEW_ERA176_ROUTE = KDS_EXPO_VIEW_ERA101_ROUTE;

export const KDS_EXPO_VIEW_ERA176_CAPABILITIES = [
  "ready_lane",
  "waiting_lane",
  "delayed_lane",
  "expo_handoff",
] as const;
