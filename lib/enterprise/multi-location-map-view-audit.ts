import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MULTI_LOCATION_MAP_ENTERPRISE_PANEL_MODULE,
  MULTI_LOCATION_MAP_VIEW_MODULE,
  MULTI_LOCATION_MAP_VIEW_TEST_ID,
  MULTI_LOCATION_MAP_VIEW_WIRING_PATHS,
} from "@/lib/enterprise/multi-location-map-view-policy";

export type MultiLocationMapViewAudit = {
  ok: boolean;
  failures: string[];
};

export function auditMultiLocationMapViewWiring(root = process.cwd()): MultiLocationMapViewAudit {
  const failures: string[] = [];

  for (const rel of MULTI_LOCATION_MAP_VIEW_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const panel = readFileSync(join(root, MULTI_LOCATION_MAP_ENTERPRISE_PANEL_MODULE), "utf8");
  if (!panel.includes("MultiLocationMapView")) {
    failures.push("multi-location-enterprise-panel.tsx missing MultiLocationMapView");
  }

  const mapView = readFileSync(join(root, MULTI_LOCATION_MAP_VIEW_MODULE), "utf8");
  if (!mapView.includes(MULTI_LOCATION_MAP_VIEW_TEST_ID)) {
    failures.push("multi-location-map-view.tsx missing map view test id");
  }
  if (!mapView.includes("multi-location-map-switcher")) {
    failures.push("multi-location-map-view.tsx missing location switcher test id");
  }
  if (!mapView.includes("floorPlanHref")) {
    failures.push("multi-location-map-view.tsx missing floor plan editor link");
  }

  const floorPlans = readFileSync(join(root, "app/dashboard/floor-plans/page.tsx"), "utf8");
  if (!floorPlans.includes("locationId")) {
    failures.push("floor-plans/page.tsx missing locationId query param wiring");
  }

  return { ok: failures.length === 0, failures };
}
