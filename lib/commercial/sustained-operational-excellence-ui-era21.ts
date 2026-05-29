/**
 * Sustained operational excellence UI slice — final era21 ops cadence surfaces.
 */
import {
  resolveSustainedOperationalExcellenceMilestoneFromPhaseStatuses,
  type SustainedOperationalExcellenceMilestone,
} from "@/lib/commercial/sustained-operational-excellence-post-market-leader-orchestrator-era21";
import { evaluateSustainedOperationalExcellenceIntegrity } from "@/lib/commercial/sustained-operational-excellence-integrity-era33";
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildSustainedOperationalExcellencePhaseStatuses,
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  detectSustainedOperationalExcellenceStarted,
  formatSustainedOperationalExcellencePhaseBlockerDetail,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  resolveMarketLeaderCompleteForSustainedOps,
  resolveNextIncompleteSustainedOperationalExcellencePhase,
  resolveSustainedOperationalExcellenceComplete,
  resolveSustainedOperationalExcellencePrerequisites,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
  type SustainedOperationalExcellencePhaseStatus,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_UI_ERA21_POLICY_ID =
  "era21-sustained-operational-excellence-ui-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_PLATFORM_ANCHOR =
  "#sustained-operational-excellence" as const;

export type SustainedOperationalExcellenceUiSlice = {
  policyId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  goDecision: string;
  customerName: string | null;
  marketLeaderComplete: boolean;
  phases: readonly SustainedOperationalExcellencePhaseStatus[];
  completedBlockingPhaseCount: number;
  blockingPhaseCount: number;
  sustainedOpsComplete: boolean;
  step9Doc: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC;
  featureMaturityDoc: typeof SERIES_A_FEATURE_MATURITY_DOC;
  forbiddenClaimsDoc: typeof SERIES_A_FORBIDDEN_CLAIMS_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  syncProgressReportCommand: string;
  postMarketLeaderOrchestratorCommand: string;
  marketLeaderExecutionCommand: string;
  marketLeaderExecutionArtifact: string;
  exportReadinessChecklistCommand: string;
  validateMarketLeaderCommand: string;
  validateMarketLeaderIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  marketLeaderIntegrityPassed: boolean;
  sustainedOpsIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  sustainedOpsMilestone: SustainedOperationalExcellenceMilestone;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  reportsHref: string;
  orderHubHref: typeof SUSTAINED_OPS_ORDER_HUB_ROUTE;
  productionCalendarHref: typeof SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE;
  nextPhase: SustainedOperationalExcellencePhaseStatus | null;
  nextPhaseDetail: string | null;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  metricsBaselineArtifact: typeof PILOT_METRICS_BASELINE_ARTIFACT_PATH;
  competitorMatrixArtifact: typeof COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH;
};

export function buildSustainedOperationalExcellenceUiSlice(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
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
}): SustainedOperationalExcellenceUiSlice | null {
  const env = input.env ?? process.env;
  const metricsBaseline = input.metricsBaseline ?? null;
  const caseStudyDraft = input.caseStudyDraft ?? null;
  const investorOnepager = input.investorOnepager ?? null;
  const rollbackDrill = input.rollbackDrill ?? null;
  const competitorMatrix = input.competitorMatrix ?? null;
  const p0ProofStatus =
    input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus =
    input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const sustainedOpsIntegrity = evaluateSustainedOperationalExcellenceIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary,
    p0StagingOverride: input.p0Staging ?? null,
    tier2SummaryOverride: input.tier2Summary ?? null,
    metricsBaselineOverride: metricsBaseline,
    caseStudyDraftOverride: caseStudyDraft,
    investorOnepagerOverride: investorOnepager,
    rollbackDrillOverride: rollbackDrill,
    competitorMatrixOverride: competitorMatrix,
    p0ProofStatusOverride: p0ProofStatus,
    tier2ProofStatusOverride: tier2ProofStatus,
  });

  const marketLeaderCompleteFromPhases = resolveMarketLeaderCompleteForSustainedOps({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging ?? null,
    tier2Summary: input.tier2Summary ?? null,
    metricsBaseline,
    caseStudyDraft,
    investorOnepager,
    rollbackDrill,
    competitorMatrix,
    env,
  });
  const sustainedOpsExecutionStarted = detectSustainedOperationalExcellenceStarted(env);

  if (!marketLeaderCompleteFromPhases && !sustainedOpsExecutionStarted) return null;

  const goDecision = input.goNoGoSummary?.decision ?? null;
  const prerequisites = resolveSustainedOperationalExcellencePrerequisites({
    goDecision: marketLeaderCompleteFromPhases ? "GO" : goDecision,
    marketLeaderComplete: marketLeaderCompleteFromPhases,
  });
  if (!prerequisites.prerequisitesComplete && !sustainedOpsExecutionStarted) {
    return null;
  }

  const phases = marketLeaderCompleteFromPhases
    ? buildSustainedOperationalExcellencePhaseStatuses({
        prerequisites,
        goNoGoSummary: input.goNoGoSummary,
        p0Staging: input.p0Staging ?? null,
        tier2Summary: input.tier2Summary ?? null,
        metricsBaseline,
        competitorMatrix,
        env,
      })
    : [];
  const sustainedOpsComplete = marketLeaderCompleteFromPhases
    ? resolveSustainedOperationalExcellenceComplete(phases)
    : false;
  if (sustainedOpsComplete && sustainedOpsIntegrity.integrityPassed) return null;

  const blockingPhases = phases.filter((phase) => !phase.optional);
  const completedBlockingPhaseCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase = resolveNextIncompleteSustainedOperationalExcellencePhase(phases);
  const nextPhaseDetail = nextPhase
    ? formatSustainedOperationalExcellencePhaseBlockerDetail(nextPhase)
    : null;
  const sustainedOpsMilestone = resolveSustainedOperationalExcellenceMilestoneFromPhaseStatuses(
    phases,
    {
      prerequisitesComplete: marketLeaderCompleteFromPhases,
      marketLeaderComplete: marketLeaderCompleteFromPhases,
      sustainedOpsComplete: false,
    },
  );

  return {
    policyId: SUSTAINED_OPERATIONAL_EXCELLENCE_UI_ERA21_POLICY_ID,
    visible: true,
    blocked: true,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    marketLeaderComplete: marketLeaderCompleteFromPhases,
    phases,
    completedBlockingPhaseCount,
    blockingPhaseCount: blockingPhases.length,
    sustainedOpsComplete: false,
    step9Doc: SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
    featureMaturityDoc: SERIES_A_FEATURE_MATURITY_DOC,
    forbiddenClaimsDoc: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    validateCommand: "npm run ops:validate-sustained-operational-excellence-env",
    exportTemplateCommand:
      "npm run ops:export-sustained-operational-excellence-env-template -- --write",
    syncProgressReportCommand:
      "npm run ops:sync-sustained-operational-excellence-progress-report -- --write",
    postMarketLeaderOrchestratorCommand:
      "npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write",
    marketLeaderExecutionCommand: "npm run ops:run-market-leader-positioning-execution -- --write",
    marketLeaderExecutionArtifact: "artifacts/market-leader-positioning-execution-summary.json",
    exportReadinessChecklistCommand:
      "npm run ops:export-sustained-operational-excellence-readiness-checklist -- --write",
    validateMarketLeaderCommand: "npm run ops:validate-market-leader-positioning-env -- --json",
    validateMarketLeaderIntegrityCommand:
      "npm run ops:validate-market-leader-positioning-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-sustained-operational-excellence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-sustained-operational-excellence-integrity-baseline -- --write",
    marketLeaderIntegrityPassed: sustainedOpsIntegrity.marketLeaderIntegrityPassed,
    sustainedOpsIntegrityPassed: sustainedOpsIntegrity.integrityPassed,
    p0ProofStatus,
    tier2ProofStatus,
    sustainedOpsMilestone,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_OPERATIONAL_EXCELLENCE_PLATFORM_ANCHOR}`,
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
    reportsHref: "/dashboard/reports",
    orderHubHref: SUSTAINED_OPS_ORDER_HUB_ROUTE,
    productionCalendarHref: SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
    nextPhase,
    nextPhaseDetail,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    metricsBaselineArtifact: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
    competitorMatrixArtifact: COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  };
}

export function formatSustainedOperationalExcellenceProgressLabel(
  slice: SustainedOperationalExcellenceUiSlice,
): string {
  return `Sustained ops ${slice.completedBlockingPhaseCount}/${slice.blockingPhaseCount} cadences · ${slice.sustainedOpsMilestone.replaceAll("_", " ")} · GO · ${slice.customerName ?? "customer"}`;
}
