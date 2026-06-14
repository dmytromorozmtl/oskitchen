/**
 * P2-65 — Floor plan editor: visual editor + real-time table management (Lightspeed parity).
 *
 * @see docs/floor-plan-editor-p2-65.md
 */

export const FLOOR_PLAN_EDITOR_P2_65_POLICY_ID = "floor-plan-editor-p2-65-v1" as const;

export const FLOOR_PLAN_EDITOR_P2_65_DOC = "docs/floor-plan-editor-p2-65.md" as const;

export const FLOOR_PLAN_EDITOR_P2_65_ARTIFACT =
  "artifacts/floor-plan-editor-p2-65.json" as const;

export const FLOOR_PLAN_EDITOR_P2_65_PAGE = "app/dashboard/floor-plans/page.tsx" as const;

export const FLOOR_PLAN_EDITOR_P2_65_COMPONENT =
  "components/restaurant/floor-plan-editor.tsx" as const;

export const FLOOR_PLAN_EDITOR_P2_65_REALTIME_HOOK = "hooks/use-floor-plan-realtime.ts" as const;

export const FLOOR_PLAN_EDITOR_P2_65_REALTIME_SERVICE = "services/floor-plan-realtime.ts" as const;

export const FLOOR_PLAN_EDITOR_P2_65_TABLE_MGMT_MODULE =
  "lib/restaurant/floor-plan-table-management-p2-65.ts" as const;

export const FLOOR_PLAN_EDITOR_P2_65_CORPUS_MODULE =
  "lib/restaurant/floor-plan-editor-p2-65-corpus.ts" as const;

export const FLOOR_PLAN_EDITOR_P2_65_SCORING_MODULE =
  "lib/restaurant/floor-plan-editor-p2-65-scoring.ts" as const;

export const FLOOR_PLAN_EDITOR_P2_65_AUDIT_MODULE =
  "lib/restaurant/floor-plan-editor-p2-65-audit.ts" as const;

export const FLOOR_PLAN_EDITOR_P2_65_ROUTE = "/dashboard/floor-plans" as const;

export const FLOOR_PLAN_EDITOR_P2_65_EDITOR_TEST_ID = "visual-floor-plan-editor" as const;

export const FLOOR_PLAN_EDITOR_P2_65_CANVAS_TEST_ID = "floor-plan-canvas" as const;

export const FLOOR_PLAN_EDITOR_P2_65_TABLE_MGMT_TEST_ID = "floor-plan-table-management" as const;

export const FLOOR_PLAN_EDITOR_P2_65_CONNECTION_TEST_ID = "floor-plan-connection-status" as const;

export const FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT = 12 as const;

export const FLOOR_PLAN_EDITOR_P2_65_MIN_CAPABILITY_COVERAGE_PCT = 100 as const;

export const FLOOR_PLAN_EDITOR_P2_65_CHECK_NPM_SCRIPT =
  "check:floor-plan-editor-p2-65" as const;

export const FLOOR_PLAN_EDITOR_P2_65_CI_NPM_SCRIPT =
  "test:ci:floor-plan-editor-p2-65" as const;

export const FLOOR_PLAN_EDITOR_P2_65_UNIT_TEST =
  "tests/unit/floor-plan-editor-p2-65.test.ts" as const;

export const FLOOR_PLAN_EDITOR_P2_65_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const FLOOR_PLAN_EDITOR_P2_65_FLOW_STEPS = [
  "visual-canvas",
  "drag-reposition",
  "table-management-panel",
  "realtime-sync",
] as const;

export const FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES = [
  "drag_reposition",
  "status_change",
  "shape_change",
  "add_table",
  "delete_table",
  "section_filter",
  "order_link",
  "realtime_refresh",
] as const;

export type FloorPlanTableManagementCapability =
  (typeof FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES)[number];

export const FLOOR_PLAN_EDITOR_P2_65_LIGHTSPEED_PARITY_PILLARS = [
  "visual_drag_drop_canvas",
  "realtime_table_status",
  "section_zones",
  "table_shapes",
  "order_hub_links",
  "connection_badge",
] as const;

export const FLOOR_PLAN_EDITOR_P2_65_LIGHTSPEED_PARITY_NOTE =
  "Visual floor plan editor with drag-and-drop layout and real-time table management — comparable to Lightspeed floor plan, without claiming certified parity." as const;

export const FLOOR_PLAN_EDITOR_P2_65_WIRING_PATHS = [
  FLOOR_PLAN_EDITOR_P2_65_DOC,
  FLOOR_PLAN_EDITOR_P2_65_ARTIFACT,
  FLOOR_PLAN_EDITOR_P2_65_CORPUS_MODULE,
  FLOOR_PLAN_EDITOR_P2_65_SCORING_MODULE,
  FLOOR_PLAN_EDITOR_P2_65_AUDIT_MODULE,
  FLOOR_PLAN_EDITOR_P2_65_TABLE_MGMT_MODULE,
  FLOOR_PLAN_EDITOR_P2_65_PAGE,
  FLOOR_PLAN_EDITOR_P2_65_COMPONENT,
  FLOOR_PLAN_EDITOR_P2_65_REALTIME_HOOK,
  FLOOR_PLAN_EDITOR_P2_65_REALTIME_SERVICE,
  "lib/restaurant/floor-plan-realtime-policy.ts",
  FLOOR_PLAN_EDITOR_P2_65_UNIT_TEST,
  FLOOR_PLAN_EDITOR_P2_65_CI_WORKFLOW,
  "actions/restaurant/tables.ts",
] as const;
