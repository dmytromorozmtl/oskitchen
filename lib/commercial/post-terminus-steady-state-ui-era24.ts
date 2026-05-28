/**
 * Post-terminus steady state UI slice — embedded in engineering path terminus panel.
 */
import {
  ERA_CHARTER_CRITERIA,
  POST_TERMINUS_STEADY_STATE_GUARDRAILS,
  POST_TERMINUS_STEADY_STATE_PLATFORM_ANCHOR,
  POST_TERMINUS_STEADY_STATE_STEP14_DOC,
  STEADY_STATE_RELEASE_TRAIN,
  type SteadyStateTrackStatus,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import {
  buildCommercialPilotPathAbsoluteEndUiSlice,
  type CommercialPilotPathAbsoluteEndUiSlice,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const POST_TERMINUS_STEADY_STATE_UI_ERA24_POLICY_ID =
  "era24-post-terminus-steady-state-ui-v1" as const;

export type PostTerminusSteadyStateUiSlice = {
  policyId: typeof POST_TERMINUS_STEADY_STATE_UI_ERA24_POLICY_ID;
  visible: boolean;
  steadyStateActive: boolean;
  engineeringTerminusActive: boolean;
  goDecision: string | null;
  tracks: readonly SteadyStateTrackStatus[];
  releaseTrain: readonly string[];
  eraCharterCriteria: typeof ERA_CHARTER_CRITERIA;
  guardrails: readonly string[];
  healthyCount: number;
  overdueCount: number;
  guidanceCount: number;
  nextAttentionTrack: SteadyStateTrackStatus | null;
  step14Doc: typeof POST_TERMINUS_STEADY_STATE_STEP14_DOC;
  validateCommand: string;
  syncReportCommand: string;
  exportEraCharterChecklistCommand: string;
  platformOpsHref: string;
  absolutePathEnd: CommercialPilotPathAbsoluteEndUiSlice | null;
};

export function buildPostTerminusSteadyStateUiSlice(input: {
  engineeringTerminusActive: boolean;
  env?: NodeJS.ProcessEnv;
}): PostTerminusSteadyStateUiSlice | null {
  if (!input.engineeringTerminusActive) return null;

  const evaluation = evaluateSteadyStateOperatorLoop(input.env);
  const nextAttentionTrack =
    evaluation.tracks.find((track) => track.status === "overdue") ?? null;
  const absolutePathEnd = buildCommercialPilotPathAbsoluteEndUiSlice({
    steadyStateActive: evaluation.steadyStateActive,
    env: input.env,
  });

  return {
    policyId: POST_TERMINUS_STEADY_STATE_UI_ERA24_POLICY_ID,
    visible: true,
    steadyStateActive: evaluation.steadyStateActive,
    engineeringTerminusActive: evaluation.engineeringTerminusActive,
    goDecision: evaluation.goDecision,
    tracks: evaluation.tracks,
    releaseTrain: STEADY_STATE_RELEASE_TRAIN,
    eraCharterCriteria: ERA_CHARTER_CRITERIA,
    guardrails: POST_TERMINUS_STEADY_STATE_GUARDRAILS,
    healthyCount: evaluation.health.healthyCount,
    overdueCount: evaluation.health.overdueCount,
    guidanceCount: evaluation.health.guidanceCount,
    nextAttentionTrack,
    step14Doc: POST_TERMINUS_STEADY_STATE_STEP14_DOC,
    validateCommand: "npm run ops:validate-steady-state-operator-loop",
    syncReportCommand: "npm run ops:sync-steady-state-operator-loop-report -- --write",
    exportEraCharterChecklistCommand:
      "npm run ops:export-era-charter-readiness-checklist -- --write",
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${POST_TERMINUS_STEADY_STATE_PLATFORM_ANCHOR}`,
    absolutePathEnd,
  };
}

export function formatPostTerminusSteadyStateProgressLabel(
  slice: PostTerminusSteadyStateUiSlice,
): string {
  if (slice.overdueCount > 0) {
    return `Steady state · ${slice.overdueCount} track(s) need attention · repeat forever`;
  }
  return `Steady state · post-terminus loop active · GO · repeat Step 12 rhythms`;
}
