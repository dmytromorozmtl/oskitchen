/**
 * Engineering path terminus UI slice — embedded in maintenance mode platform panel.
 */
import {
  resolveEngineeringPathTerminusMilestoneFromSummary,
  type EngineeringPathTerminusMilestone,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import {
  ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR,
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
  type CommercialPilotPathStepStatus,
  type CommercialPilotPathSummary,
} from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { buildPostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";
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
  postMaintenanceModeOrchestratorCommand: string;
  validateMaintenanceModeCommand: string;
  engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  productEvolutionReady: boolean;
  maintenanceModeMilestone: ReturnType<typeof evaluateMaintenanceMode>["maintenanceModeMilestone"];
  pureOperationalModeTerminusHref: string;
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
  const maintenanceMode = evaluateMaintenanceMode(input.env);
  const postTerminusSteadyState = buildPostTerminusSteadyStateUiSlice({
    engineeringTerminusActive: evaluation.summary.engineeringTerminusActive,
    env: input.env,
  });
  const engineeringPathTerminusMilestone = resolveEngineeringPathTerminusMilestoneFromSummary({
    maintenanceMode,
    summary: evaluation.summary,
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
    postMaintenanceModeOrchestratorCommand:
      "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
    validateMaintenanceModeCommand: "npm run ops:validate-maintenance-mode -- --json",
    engineeringPathTerminusMilestone,
    sustainedOpsConvergenceReady: maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: maintenanceMode.prerequisites.pureOperationalModeEra25Active,
    productEvolutionReady: maintenanceMode.prerequisites.productEvolutionReady,
    maintenanceModeMilestone: maintenanceMode.maintenanceModeMilestone,
    pureOperationalModeTerminusHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}`,
    syncStatusReportCommand: "npm run ops:sync-commercial-pilot-path-status-report -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR}`,
    postTerminusSteadyState,
  };
}

export function formatEngineeringPathTerminusProgressLabel(
  slice: EngineeringPathTerminusUiSlice,
): string {
  const milestone = slice.engineeringPathTerminusMilestone.replaceAll("_", " ");
  if (slice.firstBlockedGateStep) {
    return `Engineering path · gate blocked S${slice.firstBlockedGateStep.step} · ${milestone} · ${slice.completedSteps}/${slice.totalSteps}`;
  }
  return `Engineering path · ${slice.completedSteps}/${slice.totalSteps} steps · ${milestone}`;
}
