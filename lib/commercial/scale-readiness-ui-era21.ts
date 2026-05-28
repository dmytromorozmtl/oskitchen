/**
 * Scale readiness UI slice — Owner Briefing, Launch Wizard, Platform ops.
 */
import {
  resolveScaleReadinessMilestoneFromPhaseStatuses,
  type ScaleReadinessMilestone,
} from "@/lib/commercial/scale-readiness-post-month2-orchestrator-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildScaleReadinessPhaseStatuses,
  formatScaleReadinessPhaseBlockerDetail,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveMonth2CompleteForScale,
  resolveNextIncompleteScaleReadinessPhase,
  resolveScaleReadinessComplete,
  resolveScaleReadinessPrerequisites,
  SCALE_READINESS_FORBIDDEN_CLAIMS_DOC,
  SCALE_READINESS_PLATFORM_OPS_ROUTE,
  SCALE_READINESS_STEP6_DOC,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
  type ScaleReadinessPhaseStatus,
} from "@/lib/commercial/scale-readiness-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const SCALE_READINESS_UI_ERA21_POLICY_ID = "era21-scale-readiness-ui-v1" as const;

export const SCALE_READINESS_PLATFORM_ANCHOR = "#scale-readiness" as const;

export type ScaleReadinessUiSlice = {
  policyId: typeof SCALE_READINESS_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  goDecision: string;
  customerName: string | null;
  month2Complete: boolean;
  phases: readonly ScaleReadinessPhaseStatus[];
  completedBlockingPhaseCount: number;
  blockingPhaseCount: number;
  scaleComplete: boolean;
  step6Doc: typeof SCALE_READINESS_STEP6_DOC;
  forbiddenClaimsDoc: typeof SCALE_READINESS_FORBIDDEN_CLAIMS_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  syncProgressReportCommand: string;
  postMonth2OrchestratorCommand: string;
  exportReadinessChecklistCommand: string;
  validateMonth2Command: string;
  scaleMilestone: ScaleReadinessMilestone;
  todayHref: string;
  launchWizardHref: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  implementationHref: string;
  reportsHref: string;
  nextPhase: ScaleReadinessPhaseStatus | null;
  nextPhaseDetail: string | null;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  p0Artifact: typeof P0_STAGING_PROOF_ARTIFACT_PATH;
  tier2Artifact: typeof TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH;
  metricsBaselineArtifact: typeof PILOT_METRICS_BASELINE_ARTIFACT_PATH;
  investorOnepagerArtifact: typeof INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH;
  caseStudyDraftArtifact: typeof PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH;
  rollbackDrillArtifact: typeof PILOT_ROLLBACK_DRILL_ARTIFACT_PATH;
};

export function buildScaleReadinessUiSlice(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  env?: NodeJS.ProcessEnv;
}): ScaleReadinessUiSlice | null {
  const metricsBaseline = input.metricsBaseline ?? null;
  const caseStudyDraft = input.caseStudyDraft ?? null;
  const investorOnepager = input.investorOnepager ?? null;
  const month2Complete = resolveMonth2CompleteForScale({
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline,
    caseStudyDraft,
    investorOnepager,
    env: input.env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const prerequisites = resolveScaleReadinessPrerequisites({
    goDecision,
    month2Complete,
  });
  if (!prerequisites.prerequisitesComplete) return null;

  const phases = buildScaleReadinessPhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging ?? null,
    tier2Summary: input.tier2Summary ?? null,
    metricsBaseline,
    caseStudyDraft,
    investorOnepager,
    rollbackDrill: input.rollbackDrill ?? null,
    env: input.env,
  });
  const scaleComplete = resolveScaleReadinessComplete(phases);
  if (scaleComplete) return null;

  const blockingPhases = phases.filter((phase) => !phase.optional);
  const completedBlockingPhaseCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase = resolveNextIncompleteScaleReadinessPhase(phases);
  const nextPhaseDetail = nextPhase ? formatScaleReadinessPhaseBlockerDetail(nextPhase) : null;
  const scaleMilestone = resolveScaleReadinessMilestoneFromPhaseStatuses(phases, {
    prerequisitesComplete: true,
    month2Complete: true,
    scaleComplete: false,
  });

  return {
    policyId: SCALE_READINESS_UI_ERA21_POLICY_ID,
    visible: true,
    blocked: true,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    month2Complete: true,
    phases,
    completedBlockingPhaseCount,
    blockingPhaseCount: blockingPhases.length,
    scaleComplete: false,
    step6Doc: SCALE_READINESS_STEP6_DOC,
    forbiddenClaimsDoc: SCALE_READINESS_FORBIDDEN_CLAIMS_DOC,
    validateCommand: "npm run ops:validate-scale-readiness-env",
    exportTemplateCommand: "npm run ops:export-scale-readiness-env-template -- --write",
    syncProgressReportCommand: "npm run ops:sync-scale-readiness-progress-report -- --write",
    postMonth2OrchestratorCommand:
      "npm run ops:run-scale-readiness-post-month2-orchestrator -- --write",
    exportReadinessChecklistCommand:
      "npm run ops:export-scale-readiness-readiness-checklist -- --write",
    validateMonth2Command: "npm run ops:validate-month2-market-readiness-env -- --json",
    scaleMilestone,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    platformOpsHref: `${SCALE_READINESS_PLATFORM_OPS_ROUTE}${SCALE_READINESS_PLATFORM_ANCHOR}`,
    integrationHealthHref: "/dashboard/integration-health",
    implementationHref: "/dashboard/implementation",
    reportsHref: "/dashboard/reports",
    nextPhase,
    nextPhaseDetail,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    p0Artifact: P0_STAGING_PROOF_ARTIFACT_PATH,
    tier2Artifact: TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
    metricsBaselineArtifact: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
    investorOnepagerArtifact: INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
    caseStudyDraftArtifact: PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
    rollbackDrillArtifact: PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  };
}

export function formatScaleReadinessProgressLabel(slice: ScaleReadinessUiSlice): string {
  return `Scale readiness ${slice.completedBlockingPhaseCount}/${slice.blockingPhaseCount} gates · ${slice.scaleMilestone.replaceAll("_", " ")} · GO · ${slice.customerName ?? "customer"}`;
}
