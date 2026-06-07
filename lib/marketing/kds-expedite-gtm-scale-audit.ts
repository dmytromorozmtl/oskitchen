import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID,
  KDS_EXPEDITE_SCREEN_COMPONENT_PATH,
  KDS_EXPEDITE_SCREEN_ROUTE,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";
import {
  KDS_EXPEDITE_GTM_SCALE_DOC_PATH,
  KDS_EXPEDITE_GTM_SCALE_HONESTY_MARKERS,
  KDS_EXPEDITE_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/kds-expedite-gtm-scale-absolute-final-policy";

export type KdsExpediteGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditKdsExpediteGtmScaleWiring(root = process.cwd()): KdsExpediteGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of KDS_EXPEDITE_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, KDS_EXPEDITE_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");

  for (const marker of KDS_EXPEDITE_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(KDS_EXPEDITE_SCREEN_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(KDS_EXPEDITE_SCREEN_ROUTE)) {
    failures.push("doc missing expedite screen route");
  }

  if (!docSource.includes("/dashboard/kitchen/expo")) {
    failures.push("doc missing expo screen cross-link");
  }

  if (
    !componentSource.includes("kds-expedite-screen-absolute-final-v1") &&
    !componentSource.includes(KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("kds-expedite-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
