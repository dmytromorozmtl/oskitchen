/**
 * era25 Pilot Week 1 Execution Convergence evaluation.
 */
import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
import {
  derivePilotWeek1ExecutionConvergenceState,
  type PilotWeek1ExecutionConvergenceState,
} from "@/lib/commercial/load-pilot-week1-execution-convergence-state-era25";
import {
  buildLaunchWizardPilotWeek1ExecutionConvergenceSlice,
  buildPilotWeek1ExecutionConvergenceBriefingAction,
} from "@/lib/briefing/pilot-week1-execution-convergence-briefing-era25";
import { evaluatePaidPilotGoConvergenceEra25WithMilestones } from "@/scripts/ops/validate-paid-pilot-go-convergence-era25";

export function evaluatePilotWeek1ExecutionConvergenceEra25(
  env: NodeJS.ProcessEnv = process.env,
): {
  goConvergence: ReturnType<typeof evaluatePaidPilotGoConvergenceEra25WithMilestones>;
  week1State: PilotWeek1ExecutionConvergenceState;
  briefingAction: ReturnType<typeof buildPilotWeek1ExecutionConvergenceBriefingAction>;
  launchWizardSlice: ReturnType<typeof buildLaunchWizardPilotWeek1ExecutionConvergenceSlice>;
  goConvergenceReady: boolean;
  convergenceBlocked: boolean;
  convergenceTargets: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS;
  humanSteps: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC;
} {
  const goConvergence = evaluatePaidPilotGoConvergenceEra25WithMilestones(env);
  const week1State = derivePilotWeek1ExecutionConvergenceState(env);
  const goConvergenceReady =
    goConvergence.paidPilotGoConvergenceEra25Milestone ===
    "paid_pilot_go_convergence_era25_ready";

  const briefingAction = buildPilotWeek1ExecutionConvergenceBriefingAction({
    goConvergenceReady,
    week1State,
  });
  const launchWizardSlice = buildLaunchWizardPilotWeek1ExecutionConvergenceSlice(week1State);

  const convergenceReady = goConvergenceReady && week1State.week1Complete;
  const convergenceBlocked = !convergenceReady;

  return {
    goConvergence,
    week1State,
    briefingAction,
    launchWizardSlice,
    goConvergenceReady,
    convergenceBlocked,
    convergenceTargets: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
    guardrails: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
  };
}
