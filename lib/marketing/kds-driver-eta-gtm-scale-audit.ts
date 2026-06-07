import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
  KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH,
  KDS_DRIVER_ETA_TRACKING_ROUTE,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";
import {
  KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH,
  KDS_DRIVER_ETA_GTM_SCALE_HONESTY_MARKERS,
  KDS_DRIVER_ETA_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/kds-driver-eta-gtm-scale-absolute-final-policy";

export type KdsDriverEtaGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditKdsDriverEtaGtmScaleWiring(root = process.cwd()): KdsDriverEtaGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of KDS_DRIVER_ETA_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, KDS_DRIVER_ETA_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");

  for (const marker of KDS_DRIVER_ETA_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(KDS_DRIVER_ETA_TRACKING_ROUTE)) {
    failures.push("doc missing driver ETA tracking route");
  }

  if (!docSource.includes("/dashboard/kitchen/expo")) {
    failures.push("doc missing expo screen cross-link");
  }

  if (
    !componentSource.includes("kds-driver-eta-tracking-absolute-final-v1") &&
    !componentSource.includes(KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("kds-driver-eta-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
