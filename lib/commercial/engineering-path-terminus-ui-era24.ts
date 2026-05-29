/**
 * Engineering path terminus UI slice — embedded in maintenance mode platform panel.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluateEngineeringPathTerminusIntegrity } from "@/lib/commercial/engineering-path-terminus-integrity-era37";
import {
  resolveEngineeringPathTerminusMilestoneFromSummary,
  type EngineeringPathTerminusMilestone,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import {
  detectEngineeringPathTerminusStarted,
  ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR,
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
  type CommercialPilotPathStepStatus,
  type CommercialPilotPathSummary,
} from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { buildPostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import {
  resolveMaintenanceModePrerequisites,
  resolveProductEvolutionReady,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { resolveEra25PureOperationalModeContext } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";
import type { PostTerminusSteadyStateUiSlice } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ENGINEERING_TERMINUS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-engineering-terminus-era37";

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
  maintenanceModeExecutionCommand: string;
  maintenanceModeExecutionArtifact: string;
  validateMaintenanceModeCommand: string;
  validateMaintenanceModeIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  engineeringPathTerminusIntegrityPassed: boolean;
  maintenanceModeIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  productEvolutionReady: boolean;
  maintenanceModeMilestone: ReturnType<typeof evaluateMaintenanceMode>["maintenanceModeMilestone"];
  pureOperationalModeTerminusHref: string;
  syncStatusReportCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  maintenanceModeHref: string;
  postTerminusSteadyState: PostTerminusSteadyStateUiSlice | null;
};

export function buildEngineeringPathTerminusUiSlice(input: {
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
  /** @deprecated use full input — kept for tests */
  maintenanceModeActive?: boolean;
}): EngineeringPathTerminusUiSlice | null {
  const env = input.env ?? process.env;
  const p0Staging = input.p0Staging ?? null;
  const tier2Summary = input.tier2Summary ?? null;
  const metricsBaseline = input.metricsBaseline ?? null;
  const competitorMatrix = input.competitorMatrix ?? null;
  const p0ProofStatus =
    input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus =
    input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const engineeringPathTerminusIntegrity = evaluateEngineeringPathTerminusIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary ?? null,
    p0StagingOverride: p0Staging,
    tier2SummaryOverride: tier2Summary,
    metricsBaselineOverride: metricsBaseline,
    caseStudyDraftOverride: input.caseStudyDraft ?? null,
    investorOnepagerOverride: input.investorOnepager ?? null,
    rollbackDrillOverride: input.rollbackDrill ?? null,
    competitorMatrixOverride: competitorMatrix,
    p0ProofStatusOverride: p0ProofStatus,
    tier2ProofStatusOverride: tier2ProofStatus,
  });

  const productEvolutionReady = resolveProductEvolutionReady({
    goNoGoSummary: input.goNoGoSummary ?? null,
    p0Staging,
    tier2Summary,
    metricsBaseline,
    caseStudyDraft: input.caseStudyDraft ?? null,
    investorOnepager: input.investorOnepager ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
    competitorMatrix,
    env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const era25 = resolveEra25PureOperationalModeContext(env);
  const prerequisites = resolveMaintenanceModePrerequisites({
    goDecision,
    productEvolutionReady,
    era25,
  });
  const engineeringTerminusReadyFromPhases =
    input.maintenanceModeActive ?? prerequisites.maintenanceModeActive;
  const engineeringPathTerminusExecutionStarted = detectEngineeringPathTerminusStarted(env);

  if (!engineeringTerminusReadyFromPhases && !engineeringPathTerminusExecutionStarted) return null;

  const evaluation = evaluateCommercialPilotPath(env);
  const maintenanceMode = evaluateMaintenanceMode(env);
  const postTerminusSteadyState = buildPostTerminusSteadyStateUiSlice({
    engineeringTerminusActive:
      engineeringTerminusReadyFromPhases || engineeringPathTerminusExecutionStarted,
    goNoGoSummary: input.goNoGoSummary ?? null,
    p0ProofStatus,
    tier2ProofStatus,
    p0Staging,
    tier2Summary,
    metricsBaseline,
    caseStudyDraft: input.caseStudyDraft ?? null,
    investorOnepager: input.investorOnepager ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
    competitorMatrix,
    env,
  });
  const engineeringPathTerminusMilestone = resolveEngineeringPathTerminusMilestoneFromSummary({
    maintenanceMode,
    summary: evaluation.summary,
  });

  return {
    policyId: ENGINEERING_PATH_TERMINUS_UI_ERA24_POLICY_ID,
    visible: true,
    engineeringTerminusActive: engineeringTerminusReadyFromPhases,
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
    maintenanceModeExecutionCommand:
      "npm run ops:run-maintenance-mode-execution -- --write",
    maintenanceModeExecutionArtifact:
      "artifacts/maintenance-mode-execution-summary.json",
    validateMaintenanceModeCommand: "npm run ops:validate-maintenance-mode -- --json",
    validateMaintenanceModeIntegrityCommand:
      "npm run ops:validate-maintenance-mode-integrity -- --json",
    integrityValidateCommand: "npm run ops:validate-engineering-path-terminus-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-engineering-path-terminus-integrity-baseline -- --write",
    engineeringPathTerminusIntegrityPassed: engineeringPathTerminusIntegrity.integrityPassed,
    maintenanceModeIntegrityPassed: engineeringPathTerminusIntegrity.maintenanceModeIntegrityPassed,
    p0ProofStatus,
    tier2ProofStatus,
    engineeringPathTerminusMilestone,
    sustainedOpsConvergenceReady: maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: maintenanceMode.prerequisites.pureOperationalModeEra25Active,
    productEvolutionReady: maintenanceMode.prerequisites.productEvolutionReady,
    maintenanceModeMilestone: maintenanceMode.maintenanceModeMilestone,
    pureOperationalModeTerminusHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}`,
    syncStatusReportCommand: "npm run ops:sync-commercial-pilot-path-status-report -- --write",
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ENGINEERING_TERMINUS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR}`,
    maintenanceModeHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#maintenance-mode`,
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
