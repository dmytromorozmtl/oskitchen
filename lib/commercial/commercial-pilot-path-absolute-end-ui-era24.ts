/**
 * Commercial pilot path absolute end UI slice — embedded in steady-state platform panel.
 */
import {
  resolveCommercialPilotPathAbsoluteEndMilestone,
  type CommercialPilotPathAbsoluteEndMilestone,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PLATFORM_ANCHOR,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
  PATH_ABSOLUTE_END_ERA25_EXIT,
  PATH_ABSOLUTE_END_FOREVER_COMMANDS,
  PATH_ABSOLUTE_END_GUARDRAILS,
  PATH_ABSOLUTE_END_LAYERS,
  STEADY_STATE_PRODUCT_SURFACES,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import {
  buildLinearPathPermanentlyClosedUiSlice,
  type LinearPathPermanentlyClosedUiSlice,
} from "@/lib/commercial/linear-path-permanently-closed-ui-era24";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import type { EngineeringPathTerminusMilestone } from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import type { PostTerminusSteadyStateMilestone } from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_UI_ERA24_POLICY_ID =
  "era24-commercial-pilot-path-absolute-end-ui-v1" as const;

export type CommercialPilotPathAbsoluteEndUiSlice = {
  policyId: typeof COMMERCIAL_PILOT_PATH_ABSOLUTE_END_UI_ERA24_POLICY_ID;
  visible: boolean;
  absoluteEndActive: boolean;
  pathEngineeringClosed: boolean;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  pathLayers: typeof PATH_ABSOLUTE_END_LAYERS;
  productSurfaces: typeof STEADY_STATE_PRODUCT_SURFACES;
  foreverCommands: readonly string[];
  era25ExitSteps: readonly string[];
  guardrails: readonly string[];
  step15Doc: typeof COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC;
  validateCommand: string;
  postSteadyStateOrchestratorCommand: string;
  validateSteadyStateCommand: string;
  absoluteEndMilestone: CommercialPilotPathAbsoluteEndMilestone;
  syncReportCommand: string;
  platformOpsHref: string;
  linearPathPermanentlyClosed: LinearPathPermanentlyClosedUiSlice | null;
};

export function buildCommercialPilotPathAbsoluteEndUiSlice(input: {
  steadyStateActive: boolean;
  env?: NodeJS.ProcessEnv;
}): CommercialPilotPathAbsoluteEndUiSlice | null {
  if (!input.steadyStateActive) return null;

  const evaluation = evaluateCommercialPilotPathAbsoluteEnd(input.env);
  const steadyState = evaluateSteadyStateOperatorLoopWithMilestones(input.env);
  const absoluteEndMilestone = resolveCommercialPilotPathAbsoluteEndMilestone({
    absoluteEndActive: evaluation.absoluteEndActive,
    steadyStateMilestone: steadyState.steadyStateMilestone,
    firstBlockedStep: evaluation.path.summary.firstBlockedStep,
    firstBlockedGateStep: evaluation.path.summary.firstBlockedGateStep,
  });
  const linearPathPermanentlyClosed = buildLinearPathPermanentlyClosedUiSlice({
    absoluteEndActive: evaluation.absoluteEndActive,
    env: input.env,
  });

  return {
    policyId: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_UI_ERA24_POLICY_ID,
    visible: true,
    absoluteEndActive: evaluation.absoluteEndActive,
    pathEngineeringClosed: evaluation.pathEngineeringClosed,
    goDecision: evaluation.goDecision,
    completedSteps: evaluation.completedSteps,
    totalSteps: evaluation.totalSteps,
    pathLayers: evaluation.pathLayers,
    productSurfaces: STEADY_STATE_PRODUCT_SURFACES,
    foreverCommands: PATH_ABSOLUTE_END_FOREVER_COMMANDS,
    era25ExitSteps: PATH_ABSOLUTE_END_ERA25_EXIT,
    guardrails: PATH_ABSOLUTE_END_GUARDRAILS,
    step15Doc: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
    validateCommand: "npm run ops:validate-commercial-pilot-path-absolute-end",
    postSteadyStateOrchestratorCommand:
      "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
    validateSteadyStateCommand: "npm run ops:validate-steady-state-operator-loop -- --json",
    absoluteEndMilestone,
    steadyStateMilestone: steadyState.steadyStateMilestone,
    engineeringPathTerminusMilestone: steadyState.pathEvaluation.engineeringPathTerminusMilestone,
    sustainedOpsConvergenceReady:
      steadyState.pathEvaluation.maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active:
      steadyState.pathEvaluation.maintenanceMode.prerequisites.pureOperationalModeEra25Active,
    productEvolutionReady:
      steadyState.pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady,
    maintenanceModeMilestone: steadyState.pathEvaluation.maintenanceMode.maintenanceModeMilestone,
    pureOperationalModeTerminusHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}`,
    syncReportCommand: "npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PLATFORM_ANCHOR}`,
    linearPathPermanentlyClosed,
  };
}

export function formatCommercialPilotPathAbsoluteEndLabel(
  slice: CommercialPilotPathAbsoluteEndUiSlice,
): string {
  const milestone = slice.absoluteEndMilestone.replaceAll("_", " ");
  if (slice.completedSteps < slice.totalSteps) {
    return `Path absolute end · ${slice.completedSteps}/${slice.totalSteps} · ${milestone}`;
  }
  return `Path absolute end · ${slice.completedSteps}/${slice.totalSteps} · ${milestone} · linear engineering closed`;
}
