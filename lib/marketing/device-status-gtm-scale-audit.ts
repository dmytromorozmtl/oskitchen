import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEVICE_STATUS_DASHBOARD_COMPONENT_PATH,
  DEVICE_STATUS_DASHBOARD_ROUTE,
  DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";
import {
  DEVICE_STATUS_GTM_SCALE_DOC_PATH,
  DEVICE_STATUS_GTM_SCALE_HONESTY_MARKERS,
  DEVICE_STATUS_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/device-status-gtm-scale-absolute-final-policy";

export type DeviceStatusGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditDeviceStatusGtmScaleWiring(root = process.cwd()): DeviceStatusGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of DEVICE_STATUS_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, DEVICE_STATUS_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, DEVICE_STATUS_DASHBOARD_COMPONENT_PATH), "utf8");

  for (const marker of DEVICE_STATUS_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(DEVICE_STATUS_DASHBOARD_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(DEVICE_STATUS_DASHBOARD_ROUTE)) {
    failures.push("doc missing /dashboard/devices route");
  }

  if (!docSource.includes("/dashboard/integration-health")) {
    failures.push("doc missing Integration Health Center link");
  }

  if (!componentSource.includes(DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("device-status-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
