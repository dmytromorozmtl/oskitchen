import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingCommercialPilotPathAbsoluteEndAction,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-commercial-pilot-path-absolute-end-era39";
import type { CommercialPilotPathAbsoluteEndUiSlice } from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";

const baseSlice = {
  policyId: "era24-commercial-pilot-path-absolute-end-ui-v1",
  visible: true,
  absoluteEndActive: true,
  pathEngineeringClosed: true,
  goDecision: "GO",
  completedSteps: 12,
  totalSteps: 16,
  pathLayers: [],
  productSurfaces: [],
  foreverCommands: [],
  era25ExitSteps: [],
  guardrails: [],
  step15Doc: "docs/next-step-15-commercial-pilot-path-absolute-end-2026-05-28.md",
  validateCommand: "npm run ops:validate-commercial-pilot-path-absolute-end",
  postSteadyStateOrchestratorCommand:
    "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
  validateSteadyStateCommand: "npm run ops:validate-steady-state-operator-loop -- --json",
  validatePostTerminusSteadyStateIntegrityCommand:
    "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
  integrityValidateCommand:
    "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
  syncIntegrityBaselineCommand:
    "npm run ops:sync-commercial-pilot-path-absolute-end-integrity-baseline -- --write",
  commercialPilotPathAbsoluteEndIntegrityPassed: false,
  postTerminusSteadyStateIntegrityPassed: true,
  absoluteEndMilestone: "steady_state_blocked",
  steadyStateMilestone: "steady_state_healthy",
  engineeringPathTerminusMilestone: "engineering_path_terminus_healthy",
  sustainedOpsConvergenceReady: true,
  pureOperationalModeEra25Active: true,
  productEvolutionReady: true,
  maintenanceModeMilestone: "maintenance_mode_healthy",
  pureOperationalModeTerminusHref: "/platform/commercial-pilot-ops#pure-operational-mode-terminus-era25",
  syncReportCommand: "npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-commercial-pilot-path-absolute-end",
  platformOpsHref: "/platform/commercial-pilot-ops#commercial-pilot-path-absolute-end",
  linearPathPermanentlyClosed: null,
} as CommercialPilotPathAbsoluteEndUiSlice;

describe("owner-daily-briefing-commercial-pilot-path-absolute-end-era39", () => {
  it("builds ranked action with priority 14", () => {
    const action = buildOwnerDailyBriefingCommercialPilotPathAbsoluteEndAction(baseSlice);
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BRIEFING_ACTION_PRIORITY);
    expect(action!.severity).toBe("high");
    expect(action!.href).toBe("/platform/commercial-pilot-ops#commercial-pilot-path-absolute-end");
  });
});
