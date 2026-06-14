import type { FloorPlanTableManagementCapability } from "@/lib/restaurant/floor-plan-editor-p2-65-policy";

export type FloorPlanEditorScenarioP265 = {
  id: string;
  label: string;
  capabilities: FloorPlanTableManagementCapability[];
  expectsRealtime: boolean;
  section?: string;
};

export function buildFloorPlanEditorCorpusP265(): FloorPlanEditorScenarioP265[] {
  return [
    {
      id: "fp-01-drag-reposition",
      label: "Drag table T4 to patio corner",
      capabilities: ["drag_reposition"],
      expectsRealtime: false,
      section: "Patio",
    },
    {
      id: "fp-02-status-seat",
      label: "Mark T7 available → occupied when guests seated",
      capabilities: ["status_change"],
      expectsRealtime: true,
    },
    {
      id: "fp-03-status-dirty",
      label: "Mark T3 occupied → dirty after checkout",
      capabilities: ["status_change"],
      expectsRealtime: true,
    },
    {
      id: "fp-04-status-cleaning",
      label: "Mark T5 dirty → cleaning → available turnover",
      capabilities: ["status_change", "realtime_refresh"],
      expectsRealtime: true,
    },
    {
      id: "fp-05-shape-circle",
      label: "Change bar stool table to circle shape",
      capabilities: ["shape_change"],
      expectsRealtime: false,
      section: "Bar",
    },
    {
      id: "fp-06-add-table",
      label: "Add T15 to main dining during rush prep",
      capabilities: ["add_table", "drag_reposition"],
      expectsRealtime: true,
      section: "Main dining",
    },
    {
      id: "fp-07-delete-table",
      label: "Remove seasonal patio table",
      capabilities: ["delete_table"],
      expectsRealtime: true,
      section: "Patio",
    },
    {
      id: "fp-08-section-filter",
      label: "Filter canvas to private dining section only",
      capabilities: ["section_filter"],
      expectsRealtime: false,
      section: "Private dining",
    },
    {
      id: "fp-09-order-link",
      label: "Open active order from occupied T12",
      capabilities: ["order_link", "status_change"],
      expectsRealtime: false,
    },
    {
      id: "fp-10-realtime-multi-device",
      label: "Host iPad status change syncs to floor manager laptop",
      capabilities: ["realtime_refresh", "status_change"],
      expectsRealtime: true,
    },
    {
      id: "fp-11-reserve-table",
      label: "Reserve T2 for 7pm party",
      capabilities: ["status_change", "section_filter"],
      expectsRealtime: true,
    },
    {
      id: "fp-12-full-service-flow",
      label: "Seat → order link → dirty → clean → available",
      capabilities: [
        "drag_reposition",
        "status_change",
        "order_link",
        "realtime_refresh",
        "shape_change",
      ],
      expectsRealtime: true,
    },
  ];
}
