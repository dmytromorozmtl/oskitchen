/**
 * Blueprint P2-90 — Multi-station KDS (grill, fry, cold, bar, expo, packing).
 *
 * @see docs/multi-station-kds.md
 * @see app/dashboard/kitchen/multi-station/page.tsx
 */

export const MULTI_STATION_KDS_POLICY_ID = "multi-station-kds-p2-90-v1" as const;

export const MULTI_STATION_KDS_DOC = "docs/multi-station-kds.md" as const;

export const MULTI_STATION_KDS_LEGACY_POLICY = "lib/kitchen/kds-multi-station-policy.ts" as const;

export const MULTI_STATION_KDS_CONTENT_PATH =
  "lib/kitchen/multi-station-kds-p2-90-content.ts" as const;

export const MULTI_STATION_KDS_CORE_STATIONS_PATH =
  "lib/kitchen/multi-station-kds-p2-90-core-stations.ts" as const;

export const MULTI_STATION_KDS_SERVICE_PATH =
  "services/kitchen/multi-station-kds-p2-90-service.ts" as const;

export const MULTI_STATION_KDS_COMPONENT =
  "components/kitchen/multi-station-kds-panel.tsx" as const;

export const MULTI_STATION_KDS_PAGE = "app/dashboard/kitchen/multi-station/page.tsx" as const;

export const MULTI_STATION_KDS_ROUTE = "/dashboard/kitchen/multi-station" as const;

export const MULTI_STATION_KDS_STATION_COUNT = 6 as const;

export const MULTI_STATION_KDS_STATION_IDS = [
  "grill",
  "fry",
  "cold",
  "bar",
  "expo",
  "packing",
] as const;

export type MultiStationKdsStationId = (typeof MULTI_STATION_KDS_STATION_IDS)[number];

export const MULTI_STATION_KDS_TEST_IDS = [
  "multi-station-kds",
  "multi-station-kds-grill",
  "multi-station-kds-fry",
  "multi-station-kds-cold",
  "multi-station-kds-bar",
  "multi-station-kds-expo",
  "multi-station-kds-packing",
] as const;

export const MULTI_STATION_KDS_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "routing",
  "typical",
  "not certified",
] as const;

export const MULTI_STATION_KDS_AUDIT_SCRIPT = "scripts/audit-multi-station-kds.ts" as const;

export const MULTI_STATION_KDS_NPM_SCRIPT = "audit:multi-station-kds" as const;

export const MULTI_STATION_KDS_UNIT_TEST = "tests/unit/multi-station-kds.test.ts" as const;

export const MULTI_STATION_KDS_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const MULTI_STATION_KDS_WIRING_PATHS = [
  MULTI_STATION_KDS_DOC,
  MULTI_STATION_KDS_CONTENT_PATH,
  MULTI_STATION_KDS_CORE_STATIONS_PATH,
  MULTI_STATION_KDS_SERVICE_PATH,
  MULTI_STATION_KDS_COMPONENT,
  MULTI_STATION_KDS_PAGE,
  "lib/kitchen/multi-station-kds-p2-90-policy.ts",
  "lib/kitchen/multi-station-kds-p2-90-audit.ts",
  "lib/kitchen/kds-multi-station.ts",
  "services/kitchen/multi-station-service.ts",
  MULTI_STATION_KDS_UNIT_TEST,
  MULTI_STATION_KDS_LEGACY_POLICY,
] as const;
