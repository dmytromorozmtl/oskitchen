import { describe, expect, it } from "vitest";

import { formatMaintenanceModeProgressLabel } from "@/lib/commercial/maintenance-mode-ui-era24";
import type { MaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";

const slice = {
  policyId: "era24-maintenance-mode-ui-v1",
  visible: true,
  maintenanceModeActive: true,
  commercialPilotPathComplete: true,
  goDecision: "GO",
  customerName: "Acme",
  rhythms: [],
  guardrails: [],
  healthyCount: 2,
  dueSoonCount: 0,
  overdueCount: 0,
  guidanceCount: 8,
  improvementLoopOverdue: 0,
  productEvolutionOverdue: 0,
  nextAttentionRhythm: null,
  nextAttentionDetail: null,
  step12Doc: "docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md",
  rhythmCalendarDoc: "docs/maintenance-mode-rhythm-calendar-era24.md",
  validateCommand: "npm run ops:validate-maintenance-mode",
  syncPlaybookReportCommand: "npm run ops:sync-maintenance-mode-playbook-report -- --write",
  exportRhythmCalendarCommand: "npm run ops:export-maintenance-mode-rhythm-calendar -- --write",
  todayHref: "/dashboard/today",
  platformOpsHref: "/platform/commercial-pilot-ops#maintenance-mode",
  improvementLoopHref: "/platform/commercial-pilot-ops#continuous-improvement-loop",
  productEvolutionHref: "/platform/commercial-pilot-ops#sustained-product-evolution",
  orderHubHref: "/dashboard/order-hub",
  integrationHealthHref: "/dashboard/integration-health",
  engineeringPathTerminus: null,
} as MaintenanceModeUiSlice;

describe("maintenance-mode-ui-era24 labels", () => {
  it("formats path complete label", () => {
    expect(formatMaintenanceModeProgressLabel(slice)).toContain("path complete");
    expect(formatMaintenanceModeProgressLabel({ ...slice, overdueCount: 2 })).toContain(
      "2 rhythm(s) need attention",
    );
  });
});
