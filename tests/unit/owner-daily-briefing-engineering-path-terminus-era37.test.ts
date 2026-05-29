import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingEngineeringPathTerminusAction,
  ENGINEERING_PATH_TERMINUS_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-engineering-path-terminus-era37";
import type { EngineeringPathTerminusUiSlice } from "@/lib/commercial/engineering-path-terminus-ui-era24";

const baseSlice = {
  policyId: "era24-engineering-path-terminus-ui-v1",
  visible: true,
  engineeringTerminusActive: true,
  pathComplete: false,
  completedSteps: 4,
  totalSteps: 16,
  gateStepsComplete: false,
  goDecision: "GO",
  firstBlockedStep: {
    step: 1,
    id: "p0_ops_vault",
    label: "P0 ops vault — Day 0 credentials",
    policyId: "era21-p0-ops-vault-v1",
    docPath: "docs/p0-ops-vault-era21.md",
    kind: "gate" as const,
    validateCommand: "npm run ops:validate-p0-vault-env",
    complete: false,
    detail: "P0 proof blocked",
    platformAnchor: "#p0-ops-vault",
  },
  firstBlockedGateStep: {
    step: 1,
    id: "p0_ops_vault",
    label: "P0 ops vault — Day 0 credentials",
    policyId: "era21-p0-ops-vault-v1",
    docPath: "docs/p0-ops-vault-era21.md",
    kind: "gate" as const,
    validateCommand: "npm run ops:validate-p0-vault-env",
    complete: false,
    detail: "P0 proof blocked",
    platformAnchor: "#p0-ops-vault",
  },
  steps: [],
  summary: {
    pathComplete: false,
    gateStepsComplete: false,
    completedSteps: 4,
    totalSteps: 16,
    goDecision: "GO",
    engineeringTerminusActive: true,
    firstBlockedStep: null,
    firstBlockedGateStep: null,
  },
  step13Doc: "docs/next-step-13-engineering-path-terminus-2026-05-28.md",
  validateCommand: "npm run ops:validate-commercial-pilot-path",
  postMaintenanceModeOrchestratorCommand:
    "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
  validateMaintenanceModeCommand: "npm run ops:validate-maintenance-mode -- --json",
  validateMaintenanceModeIntegrityCommand:
    "npm run ops:validate-maintenance-mode-integrity -- --json",
  integrityValidateCommand: "npm run ops:validate-engineering-path-terminus-integrity -- --json",
  syncIntegrityBaselineCommand:
    "npm run ops:sync-engineering-path-terminus-integrity-baseline -- --write",
  engineeringPathTerminusIntegrityPassed: false,
  maintenanceModeIntegrityPassed: true,
  p0ProofStatus: "proof_blocked",
  tier2ProofStatus: "proof_passed",
  engineeringPathTerminusMilestone: "attention_gate_chain",
  sustainedOpsConvergenceReady: true,
  pureOperationalModeEra25Active: true,
  productEvolutionReady: true,
  maintenanceModeMilestone: "maintenance_mode_healthy",
  pureOperationalModeTerminusHref: "/platform/commercial-pilot-ops#pure-operational-mode-terminus-era25",
  syncStatusReportCommand: "npm run ops:sync-commercial-pilot-path-status-report -- --write",
  todayHref: "/dashboard/today",
  launchWizardHref: "/dashboard/launch-wizard#launch-wizard-engineering-terminus",
  platformOpsHref: "/platform/commercial-pilot-ops#engineering-path-terminus",
  maintenanceModeHref: "/platform/commercial-pilot-ops#maintenance-mode",
  postTerminusSteadyState: null,
} as EngineeringPathTerminusUiSlice;

describe("owner-daily-briefing-engineering-path-terminus-era37", () => {
  it("builds ranked action with priority 12", () => {
    const action = buildOwnerDailyBriefingEngineeringPathTerminusAction(baseSlice);
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(ENGINEERING_PATH_TERMINUS_BRIEFING_ACTION_PRIORITY);
    expect(action!.severity).toBe("high");
    expect(action!.href).toBe("/platform/commercial-pilot-ops#p0-ops-vault");
  });
});
