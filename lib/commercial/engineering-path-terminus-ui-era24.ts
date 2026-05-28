/**
 * Engineering path terminus UI slice — embedded in maintenance mode platform panel.
 */
import {
  ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR,
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
  type CommercialPilotPathStepStatus,
  type CommercialPilotPathSummary,
} from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import { buildPostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import type { PostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const ENGINEERING_PATH_TERMINUS_UI_ERA24_POLICY_ID =
  "era24-engineering-path-terminus-ui-v1" as const;

export type EngineeringPathTerminusUiSlice = {
  policyId: typeof ENGINEERING_PATH_TERMINUS_UI_ERA24_POLICY_ID;
  visible: boolean;
  engineeringTerminusActive: boolean;
  pathComplete: boolean;
  completedSteps: number;
  totalSteps: number;
  gateStepsComplete: boolean;
  goDecision: string | null;
  firstBlockedStep: CommercialPilotPathStepStatus | null;
  firstBlockedGateStep: CommercialPilotPathStepStatus | null;
  steps: CommercialPilotPathStepStatus[];
  summary: CommercialPilotPathSummary;
  step13Doc: typeof ENGINEERING_PATH_TERMINUS_STEP13_DOC;
  validateCommand: string;
  syncStatusReportCommand: string;
  platformOpsHref: string;
  postTerminusSteadyState: PostTerminusSteadyStateUiSlice | null;
};

export function buildEngineeringPathTerminusUiSlice(input: {
  maintenanceModeActive: boolean;
  env?: NodeJS.ProcessEnv;
}): EngineeringPathTerminusUiSlice | null {
  if (!input.maintenanceModeActive) return null;

  const evaluation = evaluateCommercialPilotPath(input.env);
  const postTerminusSteadyState = buildPostTerminusSteadyStateUiSlice({
    engineeringTerminusActive: evaluation.summary.engineeringTerminusActive,
    env: input.env,
  });

  return {
    policyId: ENGINEERING_PATH_TERMINUS_UI_ERA24_POLICY_ID,
    visible: true,
    engineeringTerminusActive: evaluation.summary.engineeringTerminusActive,
    pathComplete: evaluation.summary.pathComplete,
    completedSteps: evaluation.summary.completedSteps,
    totalSteps: evaluation.summary.totalSteps,
    gateStepsComplete: evaluation.summary.gateStepsComplete,
    goDecision: evaluation.summary.goDecision,
    firstBlockedStep: evaluation.summary.firstBlockedStep,
    firstBlockedGateStep: evaluation.summary.firstBlockedGateStep,
    steps: evaluation.steps,
    summary: evaluation.summary,
    step13Doc: ENGINEERING_PATH_TERMINUS_STEP13_DOC,
    validateCommand: "npm run ops:validate-commercial-pilot-path",
    syncStatusReportCommand: "npm run ops:sync-commercial-pilot-path-status-report -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR}`,
    postTerminusSteadyState,
  };
}

export function formatEngineeringPathTerminusProgressLabel(
  slice: EngineeringPathTerminusUiSlice,
): string {
  return `Engineering path · ${slice.completedSteps}/${slice.totalSteps} steps · terminus active`;
}
