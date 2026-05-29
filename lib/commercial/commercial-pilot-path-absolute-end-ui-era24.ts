/**
 * Commercial pilot path absolute end UI slice — embedded in steady-state platform panel.
 */
import {
  resolveCommercialPilotPathAbsoluteEndMilestone,
  type CommercialPilotPathAbsoluteEndMilestone,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import { evaluateCommercialPilotPathAbsoluteEndIntegrity } from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";
import {
  detectCommercialPilotPathAbsoluteEndStarted,
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
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import type { EngineeringPathTerminusMilestone } from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import type { PostTerminusSteadyStateMilestone } from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-pilot-path-absolute-end-era39";

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
  validatePostTerminusSteadyStateIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  commercialPilotPathAbsoluteEndIntegrityPassed: boolean;
  postTerminusSteadyStateIntegrityPassed: boolean;
  absoluteEndMilestone: CommercialPilotPathAbsoluteEndMilestone;
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
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  linearPathPermanentlyClosed: LinearPathPermanentlyClosedUiSlice | null;
};

export function buildCommercialPilotPathAbsoluteEndUiSlice(input: {
  steadyStateActive: boolean;
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
}): CommercialPilotPathAbsoluteEndUiSlice | null {
  const env = input.env ?? process.env;
  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;
  const absoluteEndStarted = detectCommercialPilotPathAbsoluteEndStarted(env);

  const commercialPilotPathAbsoluteEndIntegrity = evaluateCommercialPilotPathAbsoluteEndIntegrity(
    process.cwd(),
    {
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
    },
  );

  if (!input.steadyStateActive && !absoluteEndStarted) return null;

  const evaluation = evaluateCommercialPilotPathAbsoluteEnd(env);
  const steadyState = evaluateSteadyStateOperatorLoopWithMilestones(env);
  const absoluteEndMilestone = resolveCommercialPilotPathAbsoluteEndMilestone({
    absoluteEndActive: evaluation.absoluteEndActive,
    steadyStateMilestone: steadyState.steadyStateMilestone,
    firstBlockedStep: evaluation.path.summary.firstBlockedStep,
    firstBlockedGateStep: evaluation.path.summary.firstBlockedGateStep,
  });
  const linearPathPermanentlyClosed = buildLinearPathPermanentlyClosedUiSlice({
    absoluteEndActive: evaluation.absoluteEndActive,
    env,
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
    validatePostTerminusSteadyStateIntegrityCommand:
      "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-commercial-pilot-path-absolute-end-integrity-baseline -- --write",
    commercialPilotPathAbsoluteEndIntegrityPassed:
      commercialPilotPathAbsoluteEndIntegrity.integrityPassed,
    postTerminusSteadyStateIntegrityPassed:
      commercialPilotPathAbsoluteEndIntegrity.postTerminusSteadyStateIntegrityPassed,
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
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ANCHOR}`,
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
