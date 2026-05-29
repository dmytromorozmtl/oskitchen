/**
 * era25 Month 2 Market Readiness Convergence evaluation.
 */
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import {
  deriveMonth2MarketReadinessConvergenceState,
  type Month2MarketReadinessConvergenceState,
} from "@/lib/commercial/load-month2-market-readiness-convergence-state-era25";
import {
  buildLaunchWizardMonth2MarketReadinessConvergenceSlice,
  buildMonth2MarketReadinessConvergenceBriefingAction,
} from "@/lib/briefing/month2-market-readiness-convergence-briefing-era25";
import { evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones } from "@/scripts/ops/validate-pilot-week1-execution-convergence-era25";

export function evaluateMonth2MarketReadinessConvergenceEra25(
  env: NodeJS.ProcessEnv = process.env,
): {
  week1Convergence: ReturnType<typeof evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones>;
  month2State: Month2MarketReadinessConvergenceState;
  briefingAction: ReturnType<typeof buildMonth2MarketReadinessConvergenceBriefingAction>;
  launchWizardSlice: ReturnType<typeof buildLaunchWizardMonth2MarketReadinessConvergenceSlice>;
  week1ConvergenceReady: boolean;
  convergenceBlocked: boolean;
  convergenceTargets: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS;
  humanSteps: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC;
} {
  const week1Convergence = evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones(env);
  const month2State = deriveMonth2MarketReadinessConvergenceState(env);
  const week1ConvergenceReady =
    week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone ===
    "pilot_week1_execution_convergence_era25_ready";

  const briefingAction = buildMonth2MarketReadinessConvergenceBriefingAction({
    week1ConvergenceReady,
    month2State,
  });
  const launchWizardSlice = buildLaunchWizardMonth2MarketReadinessConvergenceSlice(month2State);

  const convergenceReady = week1ConvergenceReady && month2State.month2Complete;
  const convergenceBlocked = !convergenceReady;

  return {
    week1Convergence,
    month2State,
    briefingAction,
    launchWizardSlice,
    week1ConvergenceReady,
    convergenceBlocked,
    convergenceTargets: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
    guardrails: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  };
}
