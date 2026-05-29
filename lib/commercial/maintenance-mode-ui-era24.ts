/**
 * Maintenance mode UI slice — commercial pilot path complete (Step 12).
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { buildContinuousImprovementLoopUiSlice } from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import { evaluateMaintenanceModeIntegrity } from "@/lib/commercial/maintenance-mode-integrity-era36";
import {
  buildMaintenanceModeRhythmStatuses,
  detectMaintenanceModeStarted,
  formatMaintenanceModeRhythmDetail,
  MAINTENANCE_MODE_GUARDRAILS,
  MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC,
  MAINTENANCE_MODE_STEP12_DOC,
  resolveMaintenanceModeHealthSummary,
  resolveMaintenanceModePrerequisites,
  resolveNextMaintenanceModeAttentionRhythm,
  resolveProductEvolutionReady,
  type MaintenanceModeRhythmStatus,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import { resolveEra25PureOperationalModeContext } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import {
  buildEngineeringPathTerminusUiSlice,
  type EngineeringPathTerminusUiSlice,
} from "@/lib/commercial/engineering-path-terminus-ui-era24";
import {
  resolveMaintenanceModeMilestoneFromRhythmStatuses,
  type MaintenanceModeMilestone,
} from "@/lib/commercial/maintenance-mode-post-product-evolution-orchestrator-era24";
import { buildSustainedProductEvolutionUiSlice } from "@/lib/commercial/sustained-product-evolution-ui-era23";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_MAINTENANCE_MODE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-maintenance-mode-era36";

export const MAINTENANCE_MODE_UI_ERA24_POLICY_ID = "era24-maintenance-mode-ui-v1" as const;

export const MAINTENANCE_MODE_PLATFORM_ANCHOR = "#maintenance-mode" as const;

export type MaintenanceModeUiSlice = {
  policyId: typeof MAINTENANCE_MODE_UI_ERA24_POLICY_ID;
  visible: boolean;
  maintenanceModeActive: boolean;
  commercialPilotPathComplete: boolean;
  goDecision: string;
  customerName: string | null;
  rhythms: readonly MaintenanceModeRhythmStatus[];
  guardrails: readonly string[];
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  improvementLoopOverdue: number;
  productEvolutionOverdue: number;
  nextAttentionRhythm: MaintenanceModeRhythmStatus | null;
  nextAttentionDetail: string | null;
  step12Doc: typeof MAINTENANCE_MODE_STEP12_DOC;
  rhythmCalendarDoc: typeof MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC;
  validateCommand: string;
  postProductEvolutionOrchestratorCommand: string;
  ciLoopExecutionCommand: string;
  ciLoopExecutionArtifact: string;
  validateProductEvolutionCommand: string;
  validateProductEvolutionIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  maintenanceModeIntegrityPassed: boolean;
  productEvolutionIntegrityPassed: boolean;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  maintenanceModeMilestone: MaintenanceModeMilestone;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  pureOperationalModeTerminusHref: string;
  syncPlaybookReportCommand: string;
  exportRhythmCalendarCommand: string;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  productEvolutionHref: string;
  orderHubHref: string;
  integrationHealthHref: string;
  engineeringPathTerminus: EngineeringPathTerminusUiSlice | null;
};

export function buildMaintenanceModeUiSlice(input: {
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
}): MaintenanceModeUiSlice | null {
  const env = input.env ?? process.env;
  const p0Staging = input.p0Staging ?? null;
  const tier2Summary = input.tier2Summary ?? null;
  const metricsBaseline = input.metricsBaseline ?? null;
  const competitorMatrix = input.competitorMatrix ?? null;
  const p0ProofStatus =
    input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus =
    input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const maintenanceModeIntegrity = evaluateMaintenanceModeIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary,
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
    goNoGoSummary: input.goNoGoSummary,
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
  const maintenanceModeReadyFromPhases = prerequisites.maintenanceModeActive;
  const maintenanceModeExecutionStarted = detectMaintenanceModeStarted(env);

  if (!maintenanceModeReadyFromPhases && !maintenanceModeExecutionStarted) return null;

  const improvementLoop = buildContinuousImprovementLoopUiSlice(input);
  const productEvolution = buildSustainedProductEvolutionUiSlice(input);
  const rhythms = buildMaintenanceModeRhythmStatuses({
    improvementLoopOverdue: improvementLoop?.overdueCount ?? 0,
    improvementLoopDueSoon: improvementLoop?.dueSoonCount ?? 0,
    productEvolutionOverdue: productEvolution?.overdueCount ?? 0,
    productEvolutionDueSoon: productEvolution?.dueSoonCount ?? 0,
    metricsBaseline: input.metricsBaseline ?? null,
    p0Staging: input.p0Staging ?? null,
    customerName: input.goNoGoSummary?.customerName ?? null,
  });
  const health = resolveMaintenanceModeHealthSummary(rhythms);
  const nextAttentionRhythm = resolveNextMaintenanceModeAttentionRhythm(rhythms);
  const nextAttentionDetail = nextAttentionRhythm
    ? formatMaintenanceModeRhythmDetail(nextAttentionRhythm)
    : null;
  const engineeringPathTerminus = buildEngineeringPathTerminusUiSlice({
    goNoGoSummary: input.goNoGoSummary,
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
    maintenanceModeActive: maintenanceModeReadyFromPhases,
  });
  const maintenanceModeMilestone = resolveMaintenanceModeMilestoneFromRhythmStatuses(rhythms, {
    maintenanceModeActive: maintenanceModeReadyFromPhases || maintenanceModeExecutionStarted,
    productEvolutionReady: maintenanceModeReadyFromPhases || maintenanceModeExecutionStarted,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
  });

  return {
    policyId: MAINTENANCE_MODE_UI_ERA24_POLICY_ID,
    visible: true,
    maintenanceModeActive: maintenanceModeReadyFromPhases,
    commercialPilotPathComplete: maintenanceModeReadyFromPhases,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    rhythms,
    guardrails: [...MAINTENANCE_MODE_GUARDRAILS],
    healthyCount: health.healthyCount,
    dueSoonCount: health.dueSoonCount,
    overdueCount: health.overdueCount,
    guidanceCount: health.guidanceCount,
    improvementLoopOverdue: improvementLoop?.overdueCount ?? 0,
    productEvolutionOverdue: productEvolution?.overdueCount ?? 0,
    nextAttentionRhythm,
    nextAttentionDetail,
    step12Doc: MAINTENANCE_MODE_STEP12_DOC,
    rhythmCalendarDoc: MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC,
    validateCommand: "npm run ops:validate-maintenance-mode",
    postProductEvolutionOrchestratorCommand:
      "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
    ciLoopExecutionCommand:
      "npm run ops:run-continuous-improvement-loop-execution -- --write",
    ciLoopExecutionArtifact:
      "artifacts/continuous-improvement-loop-execution-summary.json",
    validateProductEvolutionCommand: "npm run ops:validate-sustained-product-evolution -- --json",
    validateProductEvolutionIntegrityCommand:
      "npm run ops:validate-sustained-product-evolution-integrity -- --json",
    integrityValidateCommand: "npm run ops:validate-maintenance-mode-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-maintenance-mode-integrity-baseline -- --write",
    maintenanceModeIntegrityPassed: maintenanceModeIntegrity.integrityPassed,
    productEvolutionIntegrityPassed: maintenanceModeIntegrity.productEvolutionIntegrityPassed,
    p0ProofStatus,
    tier2ProofStatus,
    maintenanceModeMilestone,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: prerequisites.pureOperationalModeEra25Active,
    pureOperationalModeTerminusHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}`,
    syncPlaybookReportCommand: "npm run ops:sync-maintenance-mode-playbook-report -- --write",
    exportRhythmCalendarCommand: "npm run ops:export-maintenance-mode-rhythm-calendar -- --write",
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_MAINTENANCE_MODE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${MAINTENANCE_MODE_PLATFORM_ANCHOR}`,
    improvementLoopHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`,
    productEvolutionHref: `${SERIES_A_PLATFORM_OPS_ROUTE}#sustained-product-evolution`,
    orderHubHref: "/dashboard/order-hub",
    integrationHealthHref: "/dashboard/integration-health",
    engineeringPathTerminus,
  };
}

export function formatMaintenanceModeProgressLabel(slice: MaintenanceModeUiSlice): string {
  const milestone = slice.maintenanceModeMilestone.replaceAll("_", " ");
  if (slice.overdueCount > 0) {
    return `Maintenance mode · ${slice.overdueCount} rhythm(s) need attention · ${milestone} · path complete`;
  }
  return `Maintenance mode · ${milestone} · GO · ${slice.customerName ?? "customer"}`;
}
