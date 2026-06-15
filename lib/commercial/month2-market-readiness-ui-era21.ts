/**
 * Month 2 market readiness UI slice — Owner Briefing, Launch Wizard, Platform ops.
 */
import {
  resolveMonth2MarketReadinessMilestoneFromPhaseStatuses,
  type Month2MarketReadinessMilestone,
} from "@/lib/commercial/month2-market-readiness-post-week1-orchestrator-era21";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import { evaluateMonth2MarketReadinessIntegrity } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import {
  buildMonth2MarketReadinessPhaseStatuses,
  formatMonth2MarketReadinessPhaseBlockerDetail,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MONTH2_GHOST_KITCHEN_LANDING_ROUTE,
  MONTH2_GTM_FORBIDDEN_CLAIMS_DOC,
  MONTH2_INVESTOR_ONEPAGER_DOC,
  MONTH2_MARKET_READINESS_STEP5_DOC,
  MONTH2_MEAL_PREP_LANDING_ROUTE,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  resolveMonth2MarketReadinessComplete,
  resolveMonth2MarketReadinessPrerequisites,
  resolveNextIncompleteMonth2MarketReadinessPhase,
  resolveWeek1CompleteForMonth2,
  type Month2MarketReadinessPhaseStatus,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const MONTH2_MARKET_READINESS_UI_ERA21_POLICY_ID =
  "era21-month2-market-readiness-ui-v1" as const;

export const MONTH2_MARKET_READINESS_PLATFORM_ANCHOR = "#month2-market-readiness" as const;

export type Month2MarketReadinessUiSlice = {
  policyId: typeof MONTH2_MARKET_READINESS_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  goDecision: string;
  customerName: string | null;
  week1Complete: boolean;
  phases: readonly Month2MarketReadinessPhaseStatus[];
  completedBlockingPhaseCount: number;
  blockingPhaseCount: number;
  month2Complete: boolean;
  step5Doc: typeof MONTH2_MARKET_READINESS_STEP5_DOC;
  investorDoc: typeof MONTH2_INVESTOR_ONEPAGER_DOC;
  forbiddenClaimsDoc: typeof MONTH2_GTM_FORBIDDEN_CLAIMS_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  syncProgressReportCommand: string;
  postWeek1OrchestratorCommand: string;
  exportReadinessChecklistCommand: string;
  validateWeek1Command: string;
  validateWeek1IntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  week1IntegrityPassed: boolean;
  month2IntegrityPassed: boolean;
  month2Milestone: Month2MarketReadinessMilestone;
  todayHref: string;
  launchWizardHref: string;
  reportsHref: string;
  implementationHref: string;
  ghostKitchenLandingHref: typeof MONTH2_GHOST_KITCHEN_LANDING_ROUTE;
  mealPrepLandingHref: typeof MONTH2_MEAL_PREP_LANDING_ROUTE;
  nextPhase: Month2MarketReadinessPhaseStatus | null;
  nextPhaseDetail: string | null;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  metricsBaselineArtifact: typeof PILOT_METRICS_BASELINE_ARTIFACT_PATH;
  caseStudyDraftArtifact: typeof PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH;
  investorOnepagerArtifact: typeof INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH;
};

export function buildMonth2MarketReadinessUiSlice(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  env?: NodeJS.ProcessEnv;
}): Month2MarketReadinessUiSlice | null {
  const env = input.env ?? process.env;
  const metricsBaseline = input.metricsBaseline ?? null;
  const caseStudyDraft = input.caseStudyDraft ?? null;
  const investorOnepager = input.investorOnepager ?? null;
  const month2Integrity = evaluateMonth2MarketReadinessIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGoSummary,
    metricsBaselineOverride: metricsBaseline,
    caseStudyDraftOverride: caseStudyDraft,
    investorOnepagerOverride: investorOnepager,
    p0ProofStatusOverride: input.p0ProofStatus,
    tier2ProofStatusOverride: input.tier2ProofStatus,
  });
  const week1CompleteFromPhases = resolveWeek1CompleteForMonth2({
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline,
    caseStudyDraft,
    env,
  });
  const week1Honest = week1CompleteFromPhases && month2Integrity.week1IntegrityPassed;
  const goDecision = input.goNoGoSummary?.decision ?? null;

  if (!week1Honest && !month2Integrity.month2ExecutionStarted) return null;

  const prerequisites = resolveMonth2MarketReadinessPrerequisites({
    goDecision: week1Honest ? "GO" : goDecision,
    week1Complete: week1Honest,
  });
  if (!prerequisites.prerequisitesComplete && !month2Integrity.month2ExecutionStarted) {
    return null;
  }

  const phases = week1Honest
    ? buildMonth2MarketReadinessPhaseStatuses({
        prerequisites,
        goNoGoSummary: input.goNoGoSummary,
        metricsBaseline,
        caseStudyDraft,
        investorOnepager,
        env,
      })
    : [];
  const month2Complete = week1Honest ? resolveMonth2MarketReadinessComplete(phases) : false;
  if (month2Complete && month2Integrity.integrityPassed) return null;

  const blockingPhases = phases.filter((phase) => !phase.optional);
  const completedBlockingPhaseCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase = resolveNextIncompleteMonth2MarketReadinessPhase(phases);
  const nextPhaseDetail = nextPhase
    ? formatMonth2MarketReadinessPhaseBlockerDetail(nextPhase)
    : !week1Honest
      ? "Honest Week 1 required before Month 2 — run pilot-week1 execution integrity validate."
      : null;
  const month2Milestone = week1Honest
    ? resolveMonth2MarketReadinessMilestoneFromPhaseStatuses(phases, {
        prerequisitesComplete: true,
        week1Complete: true,
        month2Complete: false,
      })
    : "week1_blocked";

  return {
    policyId: MONTH2_MARKET_READINESS_UI_ERA21_POLICY_ID,
    visible: true,
    blocked: true,
    goDecision: week1Honest ? "GO" : (goDecision ?? "unknown"),
    customerName: input.goNoGoSummary?.customerName ?? null,
    week1Complete: week1Honest,
    phases,
    completedBlockingPhaseCount,
    blockingPhaseCount: blockingPhases.length,
    month2Complete: false,
    step5Doc: MONTH2_MARKET_READINESS_STEP5_DOC,
    investorDoc: MONTH2_INVESTOR_ONEPAGER_DOC,
    forbiddenClaimsDoc: MONTH2_GTM_FORBIDDEN_CLAIMS_DOC,
    validateCommand: "npm run ops:validate-month2-market-readiness-env",
    exportTemplateCommand: "npm run ops:export-month2-market-readiness-env-template -- --write",
    syncProgressReportCommand: "npm run ops:sync-month2-market-readiness-progress-report -- --write",
    postWeek1OrchestratorCommand:
      "npm run ops:run-month2-market-readiness-post-week1-orchestrator -- --write",
    exportReadinessChecklistCommand:
      "npm run ops:export-month2-market-readiness-readiness-checklist -- --write",
    validateWeek1Command: "npm run ops:validate-pilot-week1-env -- --json",
    validateWeek1IntegrityCommand: "npm run ops:validate-pilot-week1-execution-integrity -- --json",
    integrityValidateCommand: "npm run ops:validate-month2-market-readiness-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-month2-market-readiness-integrity-baseline -- --write",
    week1IntegrityPassed: month2Integrity.week1IntegrityPassed,
    month2IntegrityPassed: month2Integrity.integrityPassed,
    month2Milestone,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    reportsHref: "/dashboard/reports",
    implementationHref: "/dashboard/implementation",
    ghostKitchenLandingHref: MONTH2_GHOST_KITCHEN_LANDING_ROUTE,
    mealPrepLandingHref: MONTH2_MEAL_PREP_LANDING_ROUTE,
    nextPhase,
    nextPhaseDetail,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    metricsBaselineArtifact: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
    caseStudyDraftArtifact: PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
    investorOnepagerArtifact: INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  };
}

export function formatMonth2MarketReadinessProgressLabel(
  slice: Month2MarketReadinessUiSlice,
): string {
  return `Month 2 ${slice.completedBlockingPhaseCount}/${slice.blockingPhaseCount} workstreams · ${slice.month2Milestone.replaceAll("_", " ")} · GO · ${slice.customerName ?? "customer"}`;
}
