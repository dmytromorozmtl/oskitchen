/**
 * Era 104 — KDS Multi-Station wiring cert (Phase 3 extension #104).
 *
 * Full path: 12-station registry → food-type routing → production + expo views.
 */

import { KDS_MULTI_STATION_POLICY_ID } from "@/lib/kitchen/kds-multi-station-policy";

export const KDS_MULTI_STATION_ERA104_POLICY_ID = "era104-kds-multi-station-v1" as const;

export const KDS_MULTI_STATION_ERA104_SUMMARY_ARTIFACT =
  "artifacts/kds-multi-station-smoke-summary.json" as const;

export const KDS_MULTI_STATION_ERA104_NPM_SCRIPT = "smoke:kds-multi-station-era104" as const;

export const KDS_MULTI_STATION_ERA104_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-multi-station-era104.ts" as const;

export const KDS_MULTI_STATION_ERA104_OPS_DOC = "docs/kds-multi-station-era104-setup.md" as const;

export const KDS_MULTI_STATION_ERA104_WIRING_PATHS = [
  "services/kitchen/multi-station-service.ts",
  "lib/kitchen/kds-multi-station.ts",
  "lib/kitchen/kds-multi-station-policy.ts",
  "components/kitchen/production-view-client.tsx",
  "services/kitchen/expo-view-service.ts",
] as const;

export const KDS_MULTI_STATION_ERA104_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Production — verify 12-station multi-station routing banner.",
  "Queue mixed orders (grill, fry, bar) — confirm food-type routing to correct stations.",
  "Open Expo view — verify routed station labels on tickets.",
  "Run npm run smoke:kds-multi-station-era104 — artifact overall PASSED.",
] as const;

export const KDS_MULTI_STATION_ERA104_CI_SCRIPTS = [
  "test:ci:kds-multi-station-era104",
  "test:ci:kds-multi-station-era104:cert",
] as const;

export const KDS_MULTI_STATION_ERA104_UNIT_TESTS = [
  "tests/unit/kds-multi-station-era104.test.ts",
  "tests/unit/kds-multi-station.test.ts",
] as const;

export const KDS_MULTI_STATION_ERA104_CANONICAL_POLICY_ID = KDS_MULTI_STATION_POLICY_ID;

export const KDS_MULTI_STATION_ERA104_MIN_STATIONS = 10 as const;

export const KDS_MULTI_STATION_ERA104_FOOD_TYPES = [
  "grill",
  "fry",
  "saute",
  "pizza",
  "cold",
  "bakery",
  "dessert",
  "bar",
  "sushi",
  "wok",
  "prep",
  "expo",
] as const;
