/**
 * Commercial pilot path absolute end UI slice — embedded in steady-state platform panel.
 */
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
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
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
    syncReportCommand: "npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PLATFORM_ANCHOR}`,
    linearPathPermanentlyClosed,
  };
}

export function formatCommercialPilotPathAbsoluteEndLabel(
  slice: CommercialPilotPathAbsoluteEndUiSlice,
): string {
  return `Path absolute end · ${slice.completedSteps}/${slice.totalSteps} · linear engineering closed`;
}
