/**
 * Era 136 — Multi-Location Dashboard 2.0 wiring cert (Phase 9 #63).
 *
 * Full path: 100+ locations → paginated ranking → drill-down → comparison.
 */

import {
  MULTI_LOCATION_DASHBOARD_2_PATH,
  MULTI_LOCATION_DASHBOARD_2_POLICY_ID,
  MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD,
} from "@/lib/enterprise/multi-location-dashboard-2-policy";

export const MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID =
  "era136-multi-location-dashboard-2-v1" as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_SUMMARY_ARTIFACT =
  "artifacts/multi-location-dashboard-2-smoke-summary.json" as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_NPM_SCRIPT =
  "smoke:multi-location-dashboard-2-era136" as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-multi-location-dashboard-2-era136.ts" as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_OPS_DOC =
  "docs/multi-location-dashboard-2-era136-setup.md" as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_SERVICE =
  "services/enterprise/multi-location-service.ts" as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_WIRING_PATHS = [
  MULTI_LOCATION_DASHBOARD_2_ERA136_SERVICE,
  "lib/enterprise/multi-location-dashboard-2-builders.ts",
  "lib/enterprise/multi-location-dashboard-2-policy.ts",
  "app/dashboard/enterprise/multi-location/page.tsx",
  "components/enterprise/multi-location-enterprise-panel.tsx",
] as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Multi-location (multi_location plan gate).",
  "Review network KPIs — consolidated rollup, revenue ranking, alerts.",
  "Search and paginate 100+ locations — enterprise scale badge appears.",
  "Select compareA/compareB — side-by-side comparison with deltas.",
  "Run npm run smoke:multi-location-dashboard-2-era136 — artifact overall PASSED.",
] as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_CI_SCRIPTS = [
  "test:ci:multi-location-dashboard-2-era136",
  "test:ci:multi-location-dashboard-2-era136:cert",
] as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_UNIT_TESTS = [
  "tests/unit/multi-location-dashboard-2-era136.test.ts",
  "tests/unit/multi-location-dashboard-2.test.ts",
] as const;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_CANONICAL_POLICY_ID =
  MULTI_LOCATION_DASHBOARD_2_POLICY_ID;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_ROUTE = MULTI_LOCATION_DASHBOARD_2_PATH;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_SCALE_THRESHOLD =
  MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD;

export const MULTI_LOCATION_DASHBOARD_2_ERA136_CAPABILITIES = [
  "pagination",
  "comparison",
  "drill-down",
  "enterprise-scale",
] as const;
