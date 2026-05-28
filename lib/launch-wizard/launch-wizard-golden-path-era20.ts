/**
 * Launch Wizard ↔ Era 20 operator golden path crosswalk.
 */

import {
  ERA20_LAUNCH_WIZARD_GOLDEN_PATH_PHASE_BY_STEP,
  ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS,
  listEra20WorkflowsForGoldenPathPhase,
  type Era20OperatorWorkflowProofRow,
} from "@/lib/commercial/era20-operator-golden-path-proof-era20";
import type { LaunchWizardStep, LaunchWizardStepId } from "@/lib/launch-wizard/launch-wizard-era19";
import { PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES } from "@/lib/commercial/pilot-operator-golden-path-era17-policy";

export type LaunchWizardGoldenPathStepLink = {
  stepId: LaunchWizardStepId;
  phaseId: string;
  phaseLabel: string;
  workflowIds: readonly string[];
};

export function resolveGoldenPathPhaseLabel(phaseId: string): string {
  const phase = PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES.find((p) => p.id === phaseId);
  return phase?.label ?? phaseId;
}

export function buildLaunchWizardGoldenPathStepLinks(
  steps: readonly LaunchWizardStep[],
): readonly LaunchWizardGoldenPathStepLink[] {
  return steps.map((step) => {
    const phaseId = ERA20_LAUNCH_WIZARD_GOLDEN_PATH_PHASE_BY_STEP[step.id];
    const workflows = listEra20WorkflowsForGoldenPathPhase(phaseId).map((w) => w.id);
    return {
      stepId: step.id,
      phaseId,
      phaseLabel: resolveGoldenPathPhaseLabel(phaseId),
      workflowIds: workflows,
    };
  });
}

export function pickPrimaryWorkflowForLaunchStep(
  stepId: LaunchWizardStepId,
): Era20OperatorWorkflowProofRow | undefined {
  const phaseId = ERA20_LAUNCH_WIZARD_GOLDEN_PATH_PHASE_BY_STEP[stepId];
  const candidates = listEra20WorkflowsForGoldenPathPhase(phaseId);
  return (
    candidates.find((row) => row.launchWizardStepId === stepId) ??
    candidates[0]
  );
}

export function launchWizardGoldenPathWorkflowCount(): number {
  return ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS.length;
}
