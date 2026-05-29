/**
 * era25 Paid Pilot GO Convergence UI slice.
 */
import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
  PAID_PILOT_GO_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  PAID_PILOT_GO_CONVERGENCE_ERA25_BACKLOG_ID,
  PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import {
  type PaidPilotGoConvergenceEra25Milestone,
} from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import type { OwnerDailyBriefingBreakthroughEra25Milestone } from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import type { LaunchWizardPaidPilotGoConvergenceSlice } from "@/lib/briefing/paid-pilot-go-convergence-briefing-era25";
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import { evaluatePaidPilotGoConvergenceEra25WithMilestones } from "@/scripts/ops/validate-paid-pilot-go-convergence-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

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
  launchWizardHref: string;
  platformOpsHref: string;
};

export function buildPaidPilotGoConvergenceEra25UiSlice(input: {
  breakthroughVisible: boolean;
  env?: NodeJS.ProcessEnv;
}): PaidPilotGoConvergenceEra25UiSlice | null {
  if (!input.breakthroughVisible) return null;

  const result = evaluatePaidPilotGoConvergenceEra25WithMilestones(input.env);

  return {
    policyId: PAID_PILOT_GO_CONVERGENCE_ERA25_UI_POLICY_ID,
    visible: true,
    outsideLinearCatalog: true,
    paidPilotGoConvergenceEra25Milestone: result.paidPilotGoConvergenceEra25Milestone,
    ownerDailyBriefingBreakthroughEra25Milestone:
      result.evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone,
    convergenceBlocked: result.evaluation.convergenceBlocked,
    goDecision: result.evaluation.goState.decision,
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
    launchWizardHref: result.evaluation.launchWizardSlice.href,
    platformOpsHref: `${SERIES_A_PLATFORM_OPS_ROUTE}${PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
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
