/**
 * Pilot Week 1 execution UI slice — Owner Briefing, Launch Wizard, Platform ops, Integration Health.
 */
import {
  resolvePilotWeek1ExecutionMilestoneFromPhaseStatuses,
  type PilotWeek1ExecutionMilestone,
} from "@/lib/commercial/pilot-week1-execution-post-go-orchestrator-era21";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  buildPilotWeek1ExecutionPhaseStatuses,
  formatPilotWeek1ExecutionPhaseBlockerDetail,
  PILOT_WEEK1_EXECUTION_STEP4_DOC,
  PILOT_WEEK1_FORBIDDEN_NARRATIVE_DOC,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  resolveNextIncompletePilotWeek1ExecutionPhase,
  resolvePilotWeek1ExecutionComplete,
  resolvePilotWeek1ExecutionPrerequisites,
  type PilotWeek1ExecutionPhaseStatus,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const PILOT_WEEK1_EXECUTION_UI_ERA21_POLICY_ID =
  "era21-pilot-week1-execution-ui-v1" as const;

export const PILOT_WEEK1_INTEGRATION_HEALTH_ANCHOR = "#integration-health-pilot-week1" as const;

export type PilotWeek1ExecutionUiSlice = {
  policyId: typeof PILOT_WEEK1_EXECUTION_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  goDecision: string;
  customerName: string | null;
  phases: readonly PilotWeek1ExecutionPhaseStatus[];
  completedPhaseCount: number;
  week1Complete: boolean;
  step4Doc: typeof PILOT_WEEK1_EXECUTION_STEP4_DOC;
  forbiddenNarrativeDoc: typeof PILOT_WEEK1_FORBIDDEN_NARRATIVE_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  syncProgressReportCommand: string;
  postGoOrchestratorCommand: string;
  exportReadinessChecklistCommand: string;
  validateGoClosureCommand: string;
  day5SmokesCommand: string;
  week1Milestone: PilotWeek1ExecutionMilestone;
  todayHref: string;
  launchWizardHref: string;
  integrationHealthHref: string;
  reportsHref: string;
  orderHubHref: string;
  posShiftsHref: string;
  nextPhase: PilotWeek1ExecutionPhaseStatus | null;
  nextPhaseDetail: string | null;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
  metricsBaselineArtifact: typeof PILOT_METRICS_BASELINE_ARTIFACT_PATH;
  caseStudyDraftArtifact: typeof PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH;
};

export function buildPilotWeek1ExecutionUiSlice(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  env?: NodeJS.ProcessEnv;
}): PilotWeek1ExecutionUiSlice | null {
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const prerequisites = resolvePilotWeek1ExecutionPrerequisites({ goDecision });
  if (!prerequisites.prerequisitesComplete) return null;

  const phases = buildPilotWeek1ExecutionPhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline: input.metricsBaseline ?? null,
    caseStudyDraft: input.caseStudyDraft ?? null,
    env: input.env,
  });
  const week1Complete = resolvePilotWeek1ExecutionComplete(phases);
  if (week1Complete) return null;

  const completedPhaseCount = phases.filter((phase) => phase.complete).length;
  const nextPhase = resolveNextIncompletePilotWeek1ExecutionPhase(phases);
  const nextPhaseDetail = nextPhase
    ? formatPilotWeek1ExecutionPhaseBlockerDetail(nextPhase)
    : null;
  const week1Milestone = resolvePilotWeek1ExecutionMilestoneFromPhaseStatuses(phases, {
    prerequisitesComplete: true,
    week1Complete: false,
  });

  return {
    policyId: PILOT_WEEK1_EXECUTION_UI_ERA21_POLICY_ID,
    visible: true,
    blocked: true,
    goDecision: "GO",
    customerName: input.goNoGoSummary?.customerName ?? null,
    phases,
    completedPhaseCount,
    week1Complete: false,
    step4Doc: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    forbiddenNarrativeDoc: PILOT_WEEK1_FORBIDDEN_NARRATIVE_DOC,
    validateCommand: "npm run ops:validate-pilot-week1-env",
    exportTemplateCommand: "npm run ops:export-pilot-week1-env-template -- --write",
    syncProgressReportCommand: "npm run ops:sync-pilot-week1-progress-report -- --write",
    postGoOrchestratorCommand: "npm run ops:run-pilot-week1-execution-post-go-orchestrator -- --write",
    exportReadinessChecklistCommand: "npm run ops:export-pilot-week1-readiness-checklist -- --write",
    validateGoClosureCommand: "npm run ops:validate-commercial-go-closure-env -- --json",
    day5SmokesCommand: "npm run smoke:pilot-metrics-baseline && npm run smoke:pilot-case-study-draft && npm run smoke:pilot-gono-go",
    week1Milestone,
    todayHref: "/dashboard/today",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    integrationHealthHref: `/dashboard/integration-health${PILOT_WEEK1_INTEGRATION_HEALTH_ANCHOR}`,
    reportsHref: "/dashboard/reports",
    orderHubHref: "/dashboard/order-hub",
    posShiftsHref: "/dashboard/pos/shifts",
    nextPhase,
    nextPhaseDetail,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
    metricsBaselineArtifact: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
    caseStudyDraftArtifact: PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  };
}

export function formatPilotWeek1ExecutionProgressLabel(slice: PilotWeek1ExecutionUiSlice): string {
  return `Pilot Week 1 ${slice.completedPhaseCount}/${slice.phases.length} days · ${slice.week1Milestone.replaceAll("_", " ")} · GO · ${slice.customerName ?? "customer"}`;
}
