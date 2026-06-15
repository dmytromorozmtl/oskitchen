import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCHEDULE_GRID_DESIGN_PANEL_PATH,
  SCHEDULE_GRID_DESIGN_WIRING_PATHS,
} from "@/lib/labor/schedule-grid-design-policy";

export type ScheduleGridDesignAudit = {
  ok: boolean;
  failures: string[];
};

export function auditScheduleGridDesignWiring(root = process.cwd()): ScheduleGridDesignAudit {
  const failures: string[] = [];

  for (const rel of SCHEDULE_GRID_DESIGN_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const panel = readFileSync(join(root, SCHEDULE_GRID_DESIGN_PANEL_PATH), "utf8");
  if (!panel.includes("schedule-grid-design-policy")) {
    failures.push("schedule-grid-drag-drop.tsx missing design policy import");
  }
  if (!panel.includes("SCHEDULE_GRID_DESIGN_TEST_ID")) {
    failures.push("schedule-grid-drag-drop.tsx missing design test id");
  }
  if (!panel.includes("SCHEDULE_GRID_LABOR_OVERLAY_TEST_ID")) {
    failures.push("schedule-grid-drag-drop.tsx missing labor overlay test id");
  }
  if (!panel.includes("SCHEDULE_GRID_CONFLICT_LEGEND_TEST_ID")) {
    failures.push("schedule-grid-drag-drop.tsx missing conflict legend test id");
  }
  if (!panel.includes("SCHEDULE_GRID_LABOR_HEATMAP_TEST_ID")) {
    failures.push("schedule-grid-drag-drop.tsx missing labor heatmap test id");
  }
  if (!panel.includes("scheduleGridLaborHeatCellClass")) {
    failures.push("schedule-grid-drag-drop.tsx missing labor heat cell classes");
  }

  return { ok: failures.length === 0, failures };
}
