import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID,
  VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH,
  VISUAL_FLOOR_PLAN_EDITOR_ROUTE,
} from "@/lib/restaurant/visual-floor-plan-editor-absolute-final-policy";
import {
  FLOOR_PLAN_GTM_SCALE_DOC_PATH,
  FLOOR_PLAN_GTM_SCALE_HONESTY_MARKERS,
  FLOOR_PLAN_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/floor-plan-gtm-scale-absolute-final-policy";

export type FloorPlanGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditFloorPlanGtmScaleWiring(root = process.cwd()): FloorPlanGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of FLOOR_PLAN_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, FLOOR_PLAN_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH), "utf8");

  for (const marker of FLOOR_PLAN_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(VISUAL_FLOOR_PLAN_EDITOR_ROUTE)) {
    failures.push("doc missing floor plan editor route");
  }

  if (
    !componentSource.includes("visual-floor-plan-editor-absolute-final-v1") &&
    !componentSource.includes(VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("floor-plan-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
