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
  postProductEvolutionOrchestratorCommand:
    "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
  validateProductEvolutionCommand: "npm run ops:validate-sustained-product-evolution -- --json",
  validateProductEvolutionIntegrityCommand:
    "npm run ops:validate-sustained-product-evolution-integrity -- --json",
  integrityValidateCommand: "npm run ops:validate-maintenance-mode-integrity -- --json",
  syncIntegrityBaselineCommand: "npm run ops:sync-maintenance-mode-integrity-baseline -- --write",
  maintenanceModeIntegrityPassed: true,
  productEvolutionIntegrityPassed: true,
  p0ProofStatus: null,
  tier2ProofStatus: null,
  sustainedOpsConvergenceReady: true,
  pureOperationalModeEra25Active: true,
  pureOperationalModeTerminusHref: "/platform/commercial-pilot-ops#pure-operational-mode-terminus-era25",
  maintenanceModeMilestone: "maintenance_mode_healthy",
  syncPlaybookReportCommand: "npm run ops:sync-maintenance-mode-playbook-report -- --write",
  exportRhythmCalendarCommand: "npm run ops:export-maintenance-mode-rhythm-calendar -- --write",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-maintenance-mode",
  platformOpsHref: "/platform/commercial-pilot-ops#maintenance-mode",
  improvementLoopHref: "/platform/commercial-pilot-ops#continuous-improvement-loop",
  productEvolutionHref: "/platform/commercial-pilot-ops#sustained-product-evolution",
  orderHubHref: "/dashboard/order-hub",
  integrationHealthHref: "/dashboard/integration-health",
  engineeringPathTerminus: null,
} as MaintenanceModeUiSlice;

describe("maintenance-mode-ui-era24 labels", () => {
  it("formats path complete label", () => {
    expect(formatMaintenanceModeProgressLabel(slice)).toContain("maintenance mode healthy");
    expect(formatMaintenanceModeProgressLabel({ ...slice, overdueCount: 2 })).toContain(
      "2 rhythm(s) need attention",
    );
  });
});
