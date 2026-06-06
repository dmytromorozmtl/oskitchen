/**
 * Era 175 — KDS Production View wiring cert (Phase 3 Round 2 #27).
 *
 * Full path: active work items → station load → bottleneck detection → kitchen ETA.
 */

import {
  KDS_PRODUCTION_VIEW_ERA100_OPS_DOC,
  KDS_PRODUCTION_VIEW_ERA100_POLICY_ID,
  KDS_PRODUCTION_VIEW_ERA100_ROUTE,
  KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT,
  KDS_PRODUCTION_VIEW_ERA100_WIRING_PATHS,
} from "@/lib/kitchen/kds-production-view-era100-policy";

export const KDS_PRODUCTION_VIEW_ERA175_POLICY_ID = "era175-kds-production-view-v1" as const;

export const KDS_PRODUCTION_VIEW_ERA175_SUMMARY_ARTIFACT =
  "artifacts/kds-production-view-era175-smoke-summary.json" as const;

export const KDS_PRODUCTION_VIEW_ERA175_NPM_SCRIPT = "smoke:kds-production-view-era175" as const;

export const KDS_PRODUCTION_VIEW_ERA175_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-production-view-era175.ts" as const;

export const KDS_PRODUCTION_VIEW_ERA175_OPS_DOC = "docs/kds-production-view-era175-setup.md" as const;

export const KDS_PRODUCTION_VIEW_ERA175_CANONICAL_OPS_DOC = KDS_PRODUCTION_VIEW_ERA100_OPS_DOC;

export const KDS_PRODUCTION_VIEW_ERA175_CANONICAL_SUMMARY_ARTIFACT =
  KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT;

export const KDS_PRODUCTION_VIEW_ERA175_WIRING_PATHS = KDS_PRODUCTION_VIEW_ERA100_WIRING_PATHS;

export const KDS_PRODUCTION_VIEW_ERA175_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Production — verify station load cards render.",
  "Queue POS or channel orders — confirm tickets route to stations with load % and ETA.",
  "Identify bottleneck station badge when one line exceeds others.",
  "Run npm run smoke:kds-production-view-era100 — canonical era100 wiring cert PASSED.",
  "Run npm run smoke:kds-production-view-era175 — artifact overall PASSED.",
] as const;

export const KDS_PRODUCTION_VIEW_ERA175_CI_SCRIPTS = [
  "test:ci:kds-production-view-era175",
  "test:ci:kds-production-view-era175:cert",
] as const;

export const KDS_PRODUCTION_VIEW_ERA175_UNIT_TESTS = [
  "tests/unit/kds-production-view-era175.test.ts",
  "tests/unit/kds-production-view-era100.test.ts",
  "tests/unit/kds-production-view.test.ts",
] as const;

export const KDS_PRODUCTION_VIEW_ERA175_CANONICAL_POLICY_ID = KDS_PRODUCTION_VIEW_ERA100_POLICY_ID;

export const KDS_PRODUCTION_VIEW_ERA175_ROUTE = KDS_PRODUCTION_VIEW_ERA100_ROUTE;

export const KDS_PRODUCTION_VIEW_ERA175_CAPABILITIES = [
  "station_load",
  "bottleneck_detection",
  "kitchen_eta",
  "multi_station_routing",
] as const;
