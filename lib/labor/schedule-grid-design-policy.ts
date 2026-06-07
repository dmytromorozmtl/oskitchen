/**
 * Absolute Final Task 61 — schedule grid design: drag-drop chrome, conflict, labour overlay.
 *
 * Visual design system for staff schedule grid (extends Task 45 drag-drop policy).
 *
 * @see lib/labor/schedule-grid-drag-drop-policy.ts
 * @see components/dashboard/staff/schedule-grid-drag-drop.tsx
 */

import { SCHEDULE_GRID_DRAG_DROP_POLICY_ID } from "@/lib/labor/schedule-grid-drag-drop-policy";

export const SCHEDULE_GRID_DESIGN_POLICY_ID = "schedule-grid-design-absolute-final-v1" as const;

export const SCHEDULE_GRID_DESIGN_UPSTREAM_POLICY_ID = SCHEDULE_GRID_DRAG_DROP_POLICY_ID;

export const SCHEDULE_GRID_DESIGN_ROUTE = "/dashboard/staff/schedule" as const;

export const SCHEDULE_GRID_DESIGN_PANEL_PATH =
  "components/dashboard/staff/schedule-grid-drag-drop.tsx" as const;

export const SCHEDULE_GRID_DESIGN_TEST_ID = "schedule-grid-design" as const;

export const SCHEDULE_GRID_LABOR_OVERLAY_TEST_ID = "schedule-grid-labor-overlay" as const;

export const SCHEDULE_GRID_CONFLICT_LEGEND_TEST_ID = "schedule-grid-conflict-legend" as const;

export const SCHEDULE_GRID_LABOR_HEATMAP_TEST_ID = "schedule-grid-labor-heatmap" as const;

/** Labour overlay intensity thresholds (% of week labor on one day). */
export const SCHEDULE_GRID_LABOR_HEAT_LOW_MAX = 10 as const;

export const SCHEDULE_GRID_LABOR_HEAT_MEDIUM_MAX = 18 as const;

export const SCHEDULE_GRID_DESIGN_FEATURES = [
  "drag_drop_grid",
  "overlap_conflict_highlight",
  "daily_labor_overlay",
  "weekly_labor_footer",
  "conflict_legend",
] as const;

export const SCHEDULE_GRID_DESIGN_WIRING_PATHS = [
  "lib/labor/schedule-grid-design-policy.ts",
  "lib/labor/schedule-grid-design-audit.ts",
  "lib/labor/schedule-grid-design-data.ts",
  SCHEDULE_GRID_DESIGN_PANEL_PATH,
  "tests/unit/schedule-grid-design.test.ts",
] as const;

export const SCHEDULE_GRID_DESIGN_UNIT_TEST = "tests/unit/schedule-grid-design.test.ts" as const;

export const SCHEDULE_GRID_DESIGN_CI_SCRIPTS = [
  "test:ci:schedule-grid-design",
  "test:ci:schedule-grid-design:cert",
] as const;

export type ScheduleGridLaborHeatLevel = "none" | "low" | "medium" | "high";

export type ScheduleGridDesignConflictSummary = {
  overlapCount: number;
  overtimeCount: number;
  hasBlockingConflict: boolean;
};
