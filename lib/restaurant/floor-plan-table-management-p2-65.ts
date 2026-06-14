import {
  FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES,
  type FloorPlanTableManagementCapability,
} from "@/lib/restaurant/floor-plan-editor-p2-65-policy";

export const FLOOR_PLAN_TABLE_STATUSES = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "DIRTY",
  "CLEANING",
] as const;

export type FloorPlanTableStatus = (typeof FLOOR_PLAN_TABLE_STATUSES)[number];

export type FloorPlanTableManagementTransition = {
  from: FloorPlanTableStatus;
  to: FloorPlanTableStatus;
  allowed: boolean;
};

const ALLOWED_STATUS_TRANSITIONS: ReadonlyArray<[FloorPlanTableStatus, FloorPlanTableStatus]> = [
  ["AVAILABLE", "OCCUPIED"],
  ["AVAILABLE", "RESERVED"],
  ["OCCUPIED", "DIRTY"],
  ["OCCUPIED", "AVAILABLE"],
  ["RESERVED", "OCCUPIED"],
  ["RESERVED", "AVAILABLE"],
  ["DIRTY", "CLEANING"],
  ["CLEANING", "AVAILABLE"],
];

export function isAllowedTableStatusTransition(
  from: FloorPlanTableStatus,
  to: FloorPlanTableStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED_STATUS_TRANSITIONS.some(([a, b]) => a === from && b === to);
}

export function listAllowedNextStatuses(
  current: FloorPlanTableStatus,
): FloorPlanTableStatus[] {
  return FLOOR_PLAN_TABLE_STATUSES.filter(
    (status) => status !== current && isAllowedTableStatusTransition(current, status),
  );
}

export function resolveTableManagementCapabilityLabel(
  capability: FloorPlanTableManagementCapability,
): string {
  switch (capability) {
    case "drag_reposition":
      return "Drag tables on canvas to reposition";
    case "status_change":
      return "Change table status from management panel";
    case "shape_change":
      return "Switch table shape (rectangle, circle, square)";
    case "add_table":
      return "Add new table to floor plan";
    case "delete_table":
      return "Remove table from floor plan";
    case "section_filter":
      return "Filter canvas by dining section";
    case "order_link":
      return "Open linked order from selected table";
    case "realtime_refresh":
      return "Sync table state via Supabase Realtime or polling";
    default:
      return capability;
  }
}

export function listAllTableManagementCapabilities(): FloorPlanTableManagementCapability[] {
  return [...FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES];
}

export function countCoveredCapabilities(
  covered: ReadonlyArray<FloorPlanTableManagementCapability>,
): number {
  const set = new Set(covered);
  return FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES.filter((c) => set.has(c)).length;
}

export function computeCapabilityCoveragePct(
  covered: ReadonlyArray<FloorPlanTableManagementCapability>,
): number {
  const total = FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES.length;
  if (total === 0) return 0;
  return Math.round((countCoveredCapabilities(covered) / total) * 100);
}
