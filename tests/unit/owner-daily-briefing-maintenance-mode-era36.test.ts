import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingMaintenanceModeAction } from "@/lib/briefing/owner-daily-briefing-maintenance-mode-era36";
import { MAINTENANCE_MODE_BRIEFING_ACTION_PRIORITY } from "@/lib/briefing/owner-daily-briefing-maintenance-mode-era36";
import type { MaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";

const baseSlice = {
  policyId: "era24-maintenance-mode-ui-v1",
  visible: true,
  maintenanceModeActive: true,
  commercialPilotPathComplete: true,
  goDecision: "GO",
  customerName: "Acme",
  rhythms: [
    {
      id: "weekly_wed_integration_health",
      label: "Weekly Wed — Integration Health review",
      frequency: "weekly" as const,
      ownerRole: "ops",
      status: "overdue" as const,
      docPath: "docs/next-step-10-continuous-improvement-loop-2026-05-28.md",
      routes: ["/dashboard/integration-health"],
      commands: ["smoke:woo-shopify-live"],
      detail: "integration overdue",
    },
  ],
  guardrails: [],
  healthyCount: 0,
  dueSoonCount: 0,
  overdueCount: 1,
  guidanceCount: 9,
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
  p0ProofStatus: "proof_passed",
  tier2ProofStatus: "proof_passed",
  maintenanceModeMilestone: "attention_weekly_rhythm",
  sustainedOpsConvergenceReady: true,
  pureOperationalModeEra25Active: true,
  pureOperationalModeTerminusHref: "/platform/commercial-pilot-ops#pure-operational-mode-terminus-era25",
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

describe("owner-daily-briefing-maintenance-mode-era36", () => {
  it("builds ranked action with priority 11", () => {
    const action = buildOwnerDailyBriefingMaintenanceModeAction(baseSlice);
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(MAINTENANCE_MODE_BRIEFING_ACTION_PRIORITY);
    expect(action!.severity).toBe("high");
    expect(action!.href).toBe("/dashboard/integration-health");
  });
});
