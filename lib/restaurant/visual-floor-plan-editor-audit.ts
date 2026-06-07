import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH,
  VISUAL_FLOOR_PLAN_EDITOR_HONESTY_MARKERS,
  VISUAL_FLOOR_PLAN_EDITOR_PAGE_PATH,
  VISUAL_FLOOR_PLAN_EDITOR_REQUIRED_MARKERS,
  VISUAL_FLOOR_PLAN_EDITOR_ROUTE,
  VISUAL_FLOOR_PLAN_EDITOR_WIRING_PATHS,
} from "@/lib/restaurant/visual-floor-plan-editor-absolute-final-policy";

export type VisualFloorPlanEditorAudit = {
  ok: boolean;
  failures: string[];
};

export function auditVisualFloorPlanEditorWiring(
  root = process.cwd(),
): VisualFloorPlanEditorAudit {
  const failures: string[] = [];

  for (const rel of VISUAL_FLOOR_PLAN_EDITOR_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, VISUAL_FLOOR_PLAN_EDITOR_PAGE_PATH), "utf8");

  for (const marker of VISUAL_FLOOR_PLAN_EDITOR_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`editor missing marker: ${marker}`);
    }
  }

  for (const marker of VISUAL_FLOOR_PLAN_EDITOR_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("FloorPlanEditor")) {
    failures.push("floor-plans page missing FloorPlanEditor");
  }

  if (!pageSource.includes("locationId")) {
    failures.push("floor-plans page missing locationId context");
  }

  if (!componentSource.includes("resolveTableShapeClass")) {
    failures.push("editor missing MICROS table shape helper");
  }

  if (!componentSource.includes("listFloorPlanSections")) {
    failures.push("editor missing section zone helper");
  }

  if (!componentSource.includes("visual-floor-plan-editor-absolute-final-v1")) {
    failures.push("editor missing policy id reference");
  }

  if (!componentSource.includes(VISUAL_FLOOR_PLAN_EDITOR_ROUTE)) {
    failures.push("editor missing route reference");
  }

  return { ok: failures.length === 0, failures };
}
