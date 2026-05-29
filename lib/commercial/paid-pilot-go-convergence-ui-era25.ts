/**
 * era25 Paid Pilot GO Convergence UI slice.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { evaluatePaidPilotGoConvergenceIntegrity } from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";
import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
  PAID_PILOT_GO_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  PAID_PILOT_GO_CONVERGENCE_ERA25_BACKLOG_ID,
  PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC,
  detectPaidPilotGoConvergenceEra25Started,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  type PaidPilotGoConvergenceEra25Milestone,
} from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import type { OwnerDailyBriefingBreakthroughEra25Milestone } from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import type { LaunchWizardPaidPilotGoConvergenceSlice } from "@/lib/briefing/paid-pilot-go-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildPilotWeek1ExecutionConvergenceEra25UiSlice,
  type PilotWeek1ExecutionConvergenceEra25UiSlice,
} from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import { evaluatePaidPilotGoConvergenceEra25WithMilestones } from "@/scripts/ops/validate-paid-pilot-go-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-era47";

export const PAID_PILOT_GO_CONVERGENCE_ERA25_UI_POLICY_ID =
  "era25-paid-pilot-go-convergence-ui-v1" as const;

export type PaidPilotGoConvergenceEra25UiSlice = {
  policyId: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_UI_POLICY_ID;
  visible: boolean;
  outsideLinearCatalog: boolean;
  paidPilotGoConvergenceEra25Milestone: PaidPilotGoConvergenceEra25Milestone;
  ownerDailyBriefingBreakthroughEra25Milestone: OwnerDailyBriefingBreakthroughEra25Milestone;
  convergenceBlocked: boolean;
  goDecision: string | null;
  icpQualified: boolean;
  loiRecorded: boolean;
  forbiddenClaimsPassed: boolean;
  kickoffChecklistPresent: boolean;
  artifactPresent: boolean;
  blockerCount: number;
  briefingAction: OwnerDailyBriefingRankedAction | null;
  launchWizardSlice: LaunchWizardPaidPilotGoConvergenceSlice;
  convergenceTargets: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  backlogId: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_BACKLOG_ID;
  guardrails: readonly string[];
  humanSteps: readonly string[];
  convergenceDoc: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_DOC;
  kickoffChecklistDoc: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC;
  foreverCommands: readonly string[];
  validateCommand: string;
  postBreakthroughOrchestratorCommand: string;
  syncReportCommand: string;
  validateBreakthroughCommand: string;
  validateBreakthroughIntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  paidPilotGoConvergenceIntegrityPassed: boolean;
  ownerDailyBriefingBreakthroughIntegrityPassed: boolean;
  launchWizardHref: string;
  platformOpsHref: string;
  pilotWeek1ExecutionConvergence: PilotWeek1ExecutionConvergenceEra25UiSlice | null;
};

export function buildPaidPilotGoConvergenceEra25UiSlice(input: {
  breakthroughVisible: boolean;
  env?: NodeJS.ProcessEnv;
  goNoGoSummary?: PilotGoNoGoSummary | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix?: CompetitorFeatureGapMatrixSummary | null;
  p0ProofStatus?: string | null;
  tier2ProofStatus?: string | null;
}): PaidPilotGoConvergenceEra25UiSlice | null {
  const env = input.env ?? process.env;
  const convergenceStarted = detectPaidPilotGoConvergenceEra25Started(env);

  if (!input.breakthroughVisible && !convergenceStarted) return null;

  const p0ProofStatus = input.p0ProofStatus ?? input.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus = input.tier2ProofStatus ?? input.tier2Summary?.tier2ProofStatus ?? null;

  const paidPilotGoConvergenceIntegrity = evaluatePaidPilotGoConvergenceIntegrity(process.cwd(), {
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

  const result = evaluatePaidPilotGoConvergenceEra25WithMilestones(env);
  const pilotWeek1ExecutionConvergence = buildPilotWeek1ExecutionConvergenceEra25UiSlice({
    goConvergenceVisible: true,
    env,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    competitorMatrix: input.competitorMatrix,
    p0ProofStatus,
    tier2ProofStatus,
  });

  return {
    policyId: PAID_PILOT_GO_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    paidPilotGoConvergenceEra25Milestone: result.paidPilotGoConvergenceEra25Milestone,
    ownerDailyBriefingBreakthroughEra25Milestone:
      result.evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    goDecision: paidPilotGoConvergenceIntegrity.goDecision ?? result.evaluation.goState.decision,
    icpQualified: result.evaluation.goState.icpQualified,
    loiRecorded: result.evaluation.goState.loiRecorded,
    forbiddenClaimsPassed: result.evaluation.goState.forbiddenClaimsPassed,
    kickoffChecklistPresent: result.evaluation.kickoffChecklistPresent,
    artifactPresent: result.evaluation.goState.artifactPresent,
    blockerCount: result.evaluation.goState.blockerCount,
    briefingAction: result.evaluation.briefingAction,
    launchWizardSlice: result.evaluation.launchWizardSlice,
    convergenceTargets: result.evaluation.convergenceTargets,
    backlogId: PAID_PILOT_GO_CONVERGENCE_ERA25_BACKLOG_ID,
    guardrails: PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
    kickoffChecklistDoc: PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC,
    foreverCommands: PAID_PILOT_GO_CONVERGENCE_ERA25_FOREVER_COMMANDS,
    validateCommand: "npm run ops:validate-paid-pilot-go-convergence-era25 -- --json",
    postBreakthroughOrchestratorCommand:
      "npm run ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25 -- --write",
    syncReportCommand: "npm run ops:sync-paid-pilot-go-convergence-era25-report -- --write",
    validateBreakthroughCommand:
      "npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json",
    validateBreakthroughIntegrityCommand:
      "npm run ops:validate-owner-daily-briefing-breakthrough-integrity -- --json",
    integrityValidateCommand:
      "npm run ops:validate-paid-pilot-go-convergence-integrity -- --json",
    syncIntegrityBaselineCommand:
      "npm run ops:sync-paid-pilot-go-convergence-integrity-baseline -- --write",
    paidPilotGoConvergenceIntegrityPassed: paidPilotGoConvergenceIntegrity.integrityPassed,
    ownerDailyBriefingBreakthroughIntegrityPassed:
      paidPilotGoConvergenceIntegrity.ownerDailyBriefingBreakthroughIntegrityPassed,
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ANCHOR}`,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    pilotWeek1ExecutionConvergence,
  };
}

export function formatPaidPilotGoConvergenceEra25Label(
  slice: PaidPilotGoConvergenceEra25UiSlice,
): string {
  const milestone = slice.paidPilotGoConvergenceEra25Milestone.replaceAll("_", " ");
  const status = slice.convergenceBlocked ? "BLOCKED" : "READY";
  const decision = slice.goDecision ?? "NO ARTIFACT";
  return `era25 paid pilot GO convergence · ${status} · ${decision} · ${milestone}`;
}
