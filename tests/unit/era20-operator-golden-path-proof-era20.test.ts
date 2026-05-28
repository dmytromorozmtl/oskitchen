import { describe, expect, it } from "vitest";

import {
  ERA20_LAUNCH_WIZARD_GOLDEN_PATH_PHASE_BY_STEP,
  ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS,
  buildEra20GoldenPathProofSummary,
  getEra20OperatorWorkflowProof,
  listEra20WorkflowsForGoldenPathPhase,
} from "@/lib/commercial/era20-operator-golden-path-proof-era20";
import {
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_WORKFLOW_IDS,
} from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";
import { LAUNCH_WIZARD_STEP_IDS } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES } from "@/lib/commercial/pilot-operator-golden-path-era17-policy";

describe("era20 operator golden path proof", () => {
  it("maps every launch wizard step to a valid tier2 phase", () => {
    const phaseIds = new Set(PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES.map((p) => p.id));
    for (const stepId of LAUNCH_WIZARD_STEP_IDS) {
      const phaseId = ERA20_LAUNCH_WIZARD_GOLDEN_PATH_PHASE_BY_STEP[stepId];
      expect(phaseIds.has(phaseId), stepId).toBe(true);
    }
  });

  it("defines eight canonical workflows", () => {
    expect(ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS).toHaveLength(8);
    expect(ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS.map((w) => w.id)).toEqual([
      ...ERA20_OPERATOR_GOLDEN_PATH_PROOF_WORKFLOW_IDS,
    ]);
  });

  it("never claims proof_passed in summary", () => {
    const summary = buildEra20GoldenPathProofSummary();
    expect(summary.policyId).toBe(ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID);
    expect(summary.workflowCount).toBe(8);
    expect(summary.launchWizardStepsMapped).toBe(LAUNCH_WIZARD_STEP_IDS.length);
  });

  it("resolves workflows by id and phase", () => {
    const row = getEra20OperatorWorkflowProof("storefront_to_packing");
    expect(row?.goldenPathPhaseId).toBe("orders");
    const posRows = listEra20WorkflowsForGoldenPathPhase("pos");
    expect(posRows.length).toBeGreaterThanOrEqual(2);
    expect(posRows.some((r) => r.id === "pos_to_inventory")).toBe(true);
  });

  it("keeps honest blockers on integration workflow", () => {
    const row = getEra20OperatorWorkflowProof("integration_health_recovery");
    expect(row?.blocker.toLowerCase()).toContain("skipped");
    expect(row?.e2eState).toBe("pilot_manual");
  });
});
