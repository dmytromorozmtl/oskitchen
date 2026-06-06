/**
 * Era 179 — KDS Multi-Station wiring cert (Phase 3 Round 2 #31).
 *
 * Full path: 12-station registry → food-type routing → production + expo views.
 */

import {
  KDS_MULTI_STATION_ERA104_FOOD_TYPES,
  KDS_MULTI_STATION_ERA104_MIN_STATIONS,
  KDS_MULTI_STATION_ERA104_OPS_DOC,
  KDS_MULTI_STATION_ERA104_POLICY_ID,
  KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT,
  KDS_MULTI_STATION_ERA104_WIRING_PATHS,
} from "@/lib/kitchen/kds-multi-station-era104-policy";

export const KDS_MULTI_STATION_ERA179_POLICY_ID = "era179-kds-multi-station-v1" as const;

export const KDS_MULTI_STATION_ERA179_SUMMARY_ARTIFACT =
  "artifacts/kds-multi-station-era179-smoke-summary.json" as const;

export const KDS_MULTI_STATION_ERA179_NPM_SCRIPT = "smoke:kds-multi-station-era179" as const;

export const KDS_MULTI_STATION_ERA179_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-multi-station-era179.ts" as const;

export const KDS_MULTI_STATION_ERA179_OPS_DOC = "docs/kds-multi-station-era179-setup.md" as const;

export const KDS_MULTI_STATION_ERA179_CANONICAL_OPS_DOC = KDS_MULTI_STATION_ERA104_OPS_DOC;

export const KDS_MULTI_STATION_ERA179_CANONICAL_SUMMARY_ARTIFACT =
  KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT;

export const KDS_MULTI_STATION_ERA179_WIRING_PATHS = KDS_MULTI_STATION_ERA104_WIRING_PATHS;

export const KDS_MULTI_STATION_ERA179_MIN_STATIONS = KDS_MULTI_STATION_ERA104_MIN_STATIONS;

export const KDS_MULTI_STATION_ERA179_FOOD_TYPES = KDS_MULTI_STATION_ERA104_FOOD_TYPES;

export const KDS_MULTI_STATION_ERA179_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Production — verify 12-station multi-station routing banner.",
  "Queue mixed orders (grill, fry, bar) — confirm food-type routing to correct stations.",
  "Open Expo view — verify routed station labels on tickets.",
  "Run npm run smoke:kds-multi-station-era104 — canonical era104 wiring cert PASSED.",
  "Run npm run smoke:kds-multi-station-era179 — artifact overall PASSED.",
] as const;

export const KDS_MULTI_STATION_ERA179_CI_SCRIPTS = [
  "test:ci:kds-multi-station-era179",
  "test:ci:kds-multi-station-era179:cert",
] as const;

export const KDS_MULTI_STATION_ERA179_UNIT_TESTS = [
  "tests/unit/kds-multi-station-era179.test.ts",
  "tests/unit/kds-multi-station-era104.test.ts",
  "tests/unit/kds-multi-station.test.ts",
] as const;

export const KDS_MULTI_STATION_ERA179_CANONICAL_POLICY_ID = KDS_MULTI_STATION_ERA104_POLICY_ID;

export const KDS_MULTI_STATION_ERA179_CAPABILITIES = [
  "station_registry",
  "food_type_routing",
  "production_routing",
  "expo_routing",
] as const;
