import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEVICE_STATUS_DASHBOARD_COMPONENT_PATH,
  DEVICE_STATUS_DASHBOARD_HONESTY_MARKERS,
  DEVICE_STATUS_DASHBOARD_INTEGRATION_HEALTH_ROUTE,
  DEVICE_STATUS_DASHBOARD_PAGE_PATH,
  DEVICE_STATUS_DASHBOARD_REQUIRED_MARKERS,
  DEVICE_STATUS_DASHBOARD_ROUTE,
  DEVICE_STATUS_DASHBOARD_SERVICE_PATH,
  DEVICE_STATUS_DASHBOARD_STRIP_PATH,
  DEVICE_STATUS_DASHBOARD_WIRING_PATHS,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";

export type DeviceStatusDashboardAudit = {
  ok: boolean;
  failures: string[];
};

export function auditDeviceStatusDashboardWiring(root = process.cwd()): DeviceStatusDashboardAudit {
  const failures: string[] = [];

  for (const rel of DEVICE_STATUS_DASHBOARD_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, DEVICE_STATUS_DASHBOARD_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, DEVICE_STATUS_DASHBOARD_PAGE_PATH), "utf8");
  const serviceSource = readFileSync(join(root, DEVICE_STATUS_DASHBOARD_SERVICE_PATH), "utf8");
  const stripSource = readFileSync(join(root, DEVICE_STATUS_DASHBOARD_STRIP_PATH), "utf8");
  const integrationHealthPage = readFileSync(
    join(root, "app/dashboard/integration-health/page.tsx"),
    "utf8",
  );

  for (const marker of DEVICE_STATUS_DASHBOARD_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of DEVICE_STATUS_DASHBOARD_HONESTY_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("DeviceStatusDashboard")) {
    failures.push("page missing DeviceStatusDashboard");
  }

  if (!pageSource.includes("loadDeviceStatusDashboardModel")) {
    failures.push("page missing loadDeviceStatusDashboardModel");
  }

  if (!serviceSource.includes("loadHardwareDeviceFleetModel")) {
    failures.push("service missing fleet loader reuse");
  }

  if (!stripSource.includes(DEVICE_STATUS_DASHBOARD_ROUTE)) {
    failures.push("strip missing dashboard route");
  }

  if (!integrationHealthPage.includes("DeviceStatusDashboardStrip")) {
    failures.push("integration health page missing device status strip");
  }

  if (!componentSource.includes(DEVICE_STATUS_DASHBOARD_INTEGRATION_HEALTH_ROUTE)) {
    failures.push("component missing integration health back-link");
  }

  if (!componentSource.includes("device-status-dashboard-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
