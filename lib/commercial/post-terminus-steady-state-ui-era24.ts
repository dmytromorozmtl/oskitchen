/**
 * Post-terminus steady state UI slice — embedded in engineering path terminus panel.
 */
import {
  resolvePostTerminusSteadyStateMilestoneFromTrackStatuses,
  type PostTerminusSteadyStateMilestone,
} from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { evaluatePostTerminusSteadyStateIntegrity } from "@/lib/commercial/post-terminus-steady-state-integrity-era38";
import {
  detectPostTerminusSteadyStateStarted,
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
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { evaluateCommercialPilotPathWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import type { EngineeringPathTerminusMilestone } from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_POST_TERMINUS_STEADY_STATE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-post-terminus-steady-state-era38";

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
  productionPilotReadyClosureExecutionCommand: string;
  productionPilotReadyClosureExecutionArtifact: string;
  steadyStateOperatorLoopLockExecutionCommand: string;
  steadyStateOperatorLoopLockExecutionArtifact: string;
  commercialPilotPathAbsoluteEndLockExecutionCommand: string;
  commercialPilotPathAbsoluteEndLockExecutionArtifact: string;
  postEngineeringTerminusOrchestratorCommand: string;
  validateEngineeringPathTerminusCommand: string;
  validateEngineeringPathTerminusIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  postTerminusSteadyStateIntegrityPassed: boolean;
  engineeringPathTerminusIntegrityPassed: boolean;
  steadyStateMilestone: PostTerminusSteadyStateMilestone;
  engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  productEvolutionReady: boolean;
  maintenanceModeMilestone: ReturnType<
    typeof import("@/scripts/ops/validate-maintenance-mode").evaluateMaintenanceMode
  >["maintenanceModeMilestone"];
  pureOperationalModeTerminusHref: string;
  syncReportCommand: string;
  exportEraCharterChecklistCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  absolutePathEnd: CommercialPilotPathAbsoluteEndUiSlice | null;
};

export function buildPostTerminusSteadyStateUiSlice(input: {
  engineeringTerminusActive: boolean;
  goNoGoSummary?: PilotGoNoGoSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): PostTerminusSteadyStateUiSlice | null {
  const env = input.env ?? process.env;
  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;
  const postTerminusSteadyStateStarted = detectPostTerminusSteadyStateStarted(env);

  const postTerminusSteadyStateIntegrity = evaluatePostTerminusSteadyStateIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary ?? null,
    p0StagingOverride: input.p0Staging ?? null,
    tier2SummaryOverride: input.tier2Summary ?? null,
    metricsBaselineOverride: input.metricsBaseline ?? null,
    caseStudyDraftOverride: input.caseStudyDraft ?? null,
    investorOnepagerOverride: input.investorOnepager ?? null,
    rollbackDrillOverride: input.rollbackDrill ?? null,
    competitorMatrixOverride: input.competitorMatrix ?? null,
    p0ProofStatusOverride: p0ProofStatus,
    tier2ProofStatusOverride: tier2ProofStatus,
  });

  if (!input.engineeringTerminusActive && !postTerminusSteadyStateStarted) return null;

  const evaluation = evaluateSteadyStateOperatorLoop(env);
  const pathEvaluation = evaluateCommercialPilotPathWithMilestones(env);
  const nextAttentionTrack =
    evaluation.tracks.find((track) => track.status === "overdue") ?? null;
  const steadyStateMilestone = resolvePostTerminusSteadyStateMilestoneFromTrackStatuses(
    evaluation.tracks,
    {
      steadyStateActive: evaluation.steadyStateActive,
      engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
    },
  );
  const absolutePathEnd = buildCommercialPilotPathAbsoluteEndUiSlice({
    steadyStateActive: evaluation.steadyStateActive,
    goNoGoSummary: input.goNoGoSummary ?? null,
    p0ProofStatus,
    tier2ProofStatus,
    p0Staging: input.p0Staging ?? null,
    tier2Summary: input.tier2Summary ?? null,
    metricsBaseline: input.metricsBaseline ?? null,
    caseStudyDraft: input.caseStudyDraft ?? null,
    investorOnepager: input.investorOnepager ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
    competitorMatrix: input.competitorMatrix ?? null,
    env,
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
    productionPilotReadyClosureExecutionCommand:
      "npm run ops:run-production-pilot-ready-closure-execution -- --write",
    productionPilotReadyClosureExecutionArtifact:
      "artifacts/production-pilot-ready-closure-execution-summary.json",
    steadyStateOperatorLoopLockExecutionCommand:
      "npm run ops:run-steady-state-operator-loop-lock-execution -- --write",
    steadyStateOperatorLoopLockExecutionArtifact:
      "artifacts/steady-state-operator-loop-lock-execution-summary.json",
    commercialPilotPathAbsoluteEndLockExecutionCommand:
      "npm run ops:run-commercial-pilot-path-absolute-end-lock-execution -- --write",
    commercialPilotPathAbsoluteEndLockExecutionArtifact:
      "artifacts/commercial-pilot-path-absolute-end-lock-execution-summary.json",
    postEngineeringTerminusOrchestratorCommand:
      "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
    validateEngineeringPathTerminusCommand: "npm run ops:validate-commercial-pilot-path -- --json",
    validateEngineeringPathTerminusIntegrityCommand:
      "npm run ops:validate-engineering-path-terminus-integrity -- --json",
    integrityValidateCommand: "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-post-terminus-steady-state-integrity-baseline -- --write",
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    engineeringPathTerminusIntegrityPassed:
      postTerminusSteadyStateIntegrity.engineeringPathTerminusIntegrityPassed,
    steadyStateMilestone,
    engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
    sustainedOpsConvergenceReady:
      pathEvaluation.maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active:
      pathEvaluation.maintenanceMode.prerequisites.pureOperationalModeEra25Active,
    productEvolutionReady: pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady,
    maintenanceModeMilestone: pathEvaluation.maintenanceMode.maintenanceModeMilestone,
    pureOperationalModeTerminusHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}`,
    syncReportCommand: "npm run ops:sync-steady-state-operator-loop-report -- --write",
    exportEraCharterChecklistCommand:
      "npm run ops:export-era-charter-readiness-checklist -- --write",
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_POST_TERMINUS_STEADY_STATE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${POST_TERMINUS_STEADY_STATE_PLATFORM_ANCHOR}`,
    absolutePathEnd,
  };
}

export function formatPostTerminusSteadyStateProgressLabel(
  slice: PostTerminusSteadyStateUiSlice,
): string {
  const milestone = slice.steadyStateMilestone.replaceAll("_", " ");
  if (slice.overdueCount > 0) {
    return `Steady state · ${slice.overdueCount} track(s) need attention · ${milestone}`;
  }
  return `Steady state · ${milestone} · GO · repeat Step 12 rhythms`;
}
