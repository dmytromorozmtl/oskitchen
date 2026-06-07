/**
 * Absolute Final Task 92 — visual floor plan editor (Oracle MICROS parity).
 *
 * @see app/dashboard/floor-plans/page.tsx
 * @see components/restaurant/floor-plan-editor.tsx
 */

export const VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID =
  "visual-floor-plan-editor-absolute-final-v1" as const;

export const VISUAL_FLOOR_PLAN_EDITOR_ROUTE = "/dashboard/floor-plans" as const;

export const VISUAL_FLOOR_PLAN_EDITOR_PAGE_PATH = "app/dashboard/floor-plans/page.tsx" as const;

export const VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH =
  "components/restaurant/floor-plan-editor.tsx" as const;

export const VISUAL_FLOOR_PLAN_EDITOR_MICROS_PARITY_PILLARS = [
  "drag_drop_canvas",
  "status_color_legend",
  "section_zones",
  "table_shapes",
  "realtime_connection_badge",
  "order_hub_links",
  "location_context",
] as const;

export const VISUAL_FLOOR_PLAN_TABLE_SHAPES = ["RECTANGLE", "CIRCLE", "SQUARE"] as const;

export type VisualFloorPlanTableShape = (typeof VISUAL_FLOOR_PLAN_TABLE_SHAPES)[number];

export const VISUAL_FLOOR_PLAN_EDITOR_REQUIRED_MARKERS = [
  'data-testid="visual-floor-plan-editor"',
  "floor-plan-canvas",
  "floor-plan-connection-status",
] as const;

export const VISUAL_FLOOR_PLAN_EDITOR_HONESTY_MARKERS = [
  "Oracle MICROS parity",
  "BETA",
  "not certified live occupancy",
  "Supabase Realtime",
] as const;

export const VISUAL_FLOOR_PLAN_EDITOR_WIRING_PATHS = [
  VISUAL_FLOOR_PLAN_EDITOR_PAGE_PATH,
  VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH,
  "lib/restaurant/visual-floor-plan-editor-absolute-final-policy.ts",
  "lib/restaurant/visual-floor-plan-editor-audit.ts",
  "tests/unit/visual-floor-plan-editor-absolute-final.test.ts",
  "lib/restaurant/floor-plan-realtime-policy.ts",
  "hooks/use-floor-plan-realtime.ts",
] as const;

export const VISUAL_FLOOR_PLAN_EDITOR_UNIT_TEST =
  "tests/unit/visual-floor-plan-editor-absolute-final.test.ts" as const;

export const VISUAL_FLOOR_PLAN_EDITOR_CI_SCRIPTS = [
  "test:ci:visual-floor-plan-editor",
  "test:ci:visual-floor-plan-editor:cert",
] as const;

export function resolveTableShapeClass(shape: string): string {
  switch (shape.toUpperCase()) {
    case "CIRCLE":
      return "rounded-full";
    case "SQUARE":
      return "rounded-md aspect-square";
    default:
      return "rounded-xl";
  }
}

export function normalizeFloorPlanSection(section: string | null | undefined): string {
  const trimmed = section?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Main dining";
}

export function listFloorPlanSections(
  tables: ReadonlyArray<{ section: string | null }>,
): string[] {
  const sections = new Set<string>();
  for (const table of tables) {
    sections.add(normalizeFloorPlanSection(table.section));
  }
  if (sections.size === 0) {
    sections.add("Main dining");
  }
  return [...sections].sort((a, b) => a.localeCompare(b));
}

export function tableMatchesSectionFilter(
  tableSection: string | null,
  filter: string | null,
): boolean {
  if (!filter) return true;
  return normalizeFloorPlanSection(tableSection) === filter;
}
