import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_DRIVER_ETA_MIN_TOUCH_PX,
  KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH,
  KDS_DRIVER_ETA_TRACKING_EXPO_PAGE,
  KDS_DRIVER_ETA_TRACKING_HONESTY_MARKERS,
  KDS_DRIVER_ETA_TRACKING_PAGE_PATH,
  KDS_DRIVER_ETA_TRACKING_PILLARS,
  KDS_DRIVER_ETA_TRACKING_REQUIRED_MARKERS,
  KDS_DRIVER_ETA_TRACKING_ROUTE,
  KDS_DRIVER_ETA_TRACKING_SERVICE_PATH,
  KDS_DRIVER_ETA_TRACKING_STRIP_PATH,
  KDS_DRIVER_ETA_TRACKING_WIRING_PATHS,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";

export type KdsDriverEtaTrackingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditKdsDriverEtaTrackingWiring(root = process.cwd()): KdsDriverEtaTrackingAudit {
  const failures: string[] = [];

  for (const rel of KDS_DRIVER_ETA_TRACKING_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, KDS_DRIVER_ETA_TRACKING_PAGE_PATH), "utf8");
  const serviceSource = readFileSync(join(root, KDS_DRIVER_ETA_TRACKING_SERVICE_PATH), "utf8");
  const stripSource = readFileSync(join(root, KDS_DRIVER_ETA_TRACKING_STRIP_PATH), "utf8");
  const expoPage = readFileSync(join(root, KDS_DRIVER_ETA_TRACKING_EXPO_PAGE), "utf8");

  for (const marker of KDS_DRIVER_ETA_TRACKING_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of KDS_DRIVER_ETA_TRACKING_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("KdsDriverEtaScreen")) {
    failures.push("page missing KdsDriverEtaScreen");
  }

  if (!pageSource.includes("loadKdsDriverEtaTrackingModel")) {
    failures.push("page missing loadKdsDriverEtaTrackingModel");
  }

  if (!serviceSource.includes("parseDispatchGpsPayload")) {
    failures.push("service missing GPS parser");
  }

  if (
    !stripSource.includes(KDS_DRIVER_ETA_TRACKING_ROUTE) &&
    !stripSource.includes("KDS_DRIVER_ETA_TRACKING_ROUTE")
  ) {
    failures.push("strip missing driver eta route");
  }

  if (!expoPage.includes("KdsDriverEtaStrip")) {
    failures.push("expo page missing driver eta strip");
  }

  if (!componentSource.includes(String(KDS_DRIVER_ETA_MIN_TOUCH_PX))) {
    failures.push("component missing min touch px");
  }

  for (const pillar of KDS_DRIVER_ETA_TRACKING_PILLARS) {
    if (!componentSource.includes(pillar)) {
      failures.push(`component missing pillar: ${pillar}`);
    }
  }

  if (!componentSource.includes("kds-driver-eta-tracking-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
