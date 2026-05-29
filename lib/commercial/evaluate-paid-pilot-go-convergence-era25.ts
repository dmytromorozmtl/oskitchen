/**
 * era25 Paid Pilot GO Convergence evaluation.
 */
import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
  PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import {
  derivePaidPilotGoConvergenceState,
  type PaidPilotGoConvergenceState,
} from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";
import {
  buildLaunchWizardPaidPilotGoConvergenceSlice,
  buildPaidPilotGoConvergenceBriefingAction,
} from "@/lib/briefing/paid-pilot-go-convergence-briefing-era25";
import { evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones } from "@/scripts/ops/validate-owner-daily-briefing-breakthrough-era25";
import { existsSync } from "node:fs";
import { join } from "node:path";

export function evaluatePaidPilotGoConvergenceEra25(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  breakthrough: ReturnType<typeof evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones>;
  goState: PaidPilotGoConvergenceState;
  briefingAction: ReturnType<typeof buildPaidPilotGoConvergenceBriefingAction>;
  launchWizardSlice: ReturnType<typeof buildLaunchWizardPaidPilotGoConvergenceSlice>;
  kickoffChecklistPresent: boolean;
  convergenceBlocked: boolean;
  convergenceTargets: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS;
  humanSteps: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_DOC;
} {
  const breakthrough = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones(env);
  const goState = derivePaidPilotGoConvergenceState(root);
  const briefingAction = buildPaidPilotGoConvergenceBriefingAction(goState);
  const launchWizardSlice = buildLaunchWizardPaidPilotGoConvergenceSlice(goState);
  const kickoffChecklistPresent = existsSync(
    join(root, PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC),
  );

  const breakthroughReady =
    breakthrough.ownerDailyBriefingBreakthroughEra25Milestone ===
    "owner_daily_briefing_breakthrough_era25_ready";

  const convergenceReady =
    breakthroughReady &&
    goState.decision === "GO" &&
    goState.icpQualified &&
    goState.loiRecorded &&
    goState.forbiddenClaimsPassed &&
    kickoffChecklistPresent;

  const convergenceBlocked = !convergenceReady;

  return {
    breakthrough,
    goState,
    briefingAction,
    launchWizardSlice,
    kickoffChecklistPresent,
    convergenceBlocked,
    convergenceTargets: PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
    guardrails: PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
  };
}
