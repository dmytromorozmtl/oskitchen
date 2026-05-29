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
import {
  buildMaintenanceModeRhythmStatuses,
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
  validateProductEvolutionCommand: string;
  maintenanceModeMilestone: MaintenanceModeMilestone;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  pureOperationalModeTerminusHref: string;
  syncPlaybookReportCommand: string;
  exportRhythmCalendarCommand: string;
  todayHref: string;
  platformOpsHref: string;
  improvementLoopHref: string;
  productEvolutionHref: string;
  orderHubHref: string;
  integrationHealthHref: string;
  engineeringPathTerminus: EngineeringPathTerminusUiSlice | null;
};

export function buildMaintenanceModeUiSlice(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): MaintenanceModeUiSlice | null {
  const productEvolutionReady = resolveProductEvolutionReady({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging ?? null,
    tier2Summary: input.tier2Summary ?? null,
    metricsBaseline: input.metricsBaseline ?? null,
    caseStudyDraft: input.caseStudyDraft ?? null,
    investorOnepager: input.investorOnepager ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
    competitorMatrix: input.competitorMatrix ?? null,
    env: input.env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const era25 = resolveEra25PureOperationalModeContext(input.env);
  const prerequisites = resolveMaintenanceModePrerequisites({
    goDecision,
    productEvolutionReady,
    era25,
  });
  if (!prerequisites.maintenanceModeActive) return null;

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
    maintenanceModeActive: true,
    env: input.env,
  });
  const maintenanceModeMilestone = resolveMaintenanceModeMilestoneFromRhythmStatuses(rhythms, {
    maintenanceModeActive: true,
    productEvolutionReady: true,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
  });

  return {
    policyId: MAINTENANCE_MODE_UI_ERA24_POLICY_ID,
    visible: true,
    maintenanceModeActive: true,
    commercialPilotPathComplete: true,
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
    validateProductEvolutionCommand: "npm run ops:validate-sustained-product-evolution -- --json",
    maintenanceModeMilestone,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: prerequisites.pureOperationalModeEra25Active,
    pureOperationalModeTerminusHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}`,
    syncPlaybookReportCommand: "npm run ops:sync-maintenance-mode-playbook-report -- --write",
    exportRhythmCalendarCommand: "npm run ops:export-maintenance-mode-rhythm-calendar -- --write",
    todayHref: "/dashboard/today",
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
