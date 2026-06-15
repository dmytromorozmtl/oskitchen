/**
 * era25 Scale Readiness Convergence evaluation.
 */
import {
  SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import {
  deriveScaleReadinessConvergenceState,
  type ScaleReadinessConvergenceState,
} from "@/lib/commercial/load-scale-readiness-convergence-state-era25";
import {
  buildLaunchWizardScaleReadinessConvergenceSlice,
  buildScaleReadinessConvergenceBriefingAction,
} from "@/lib/briefing/scale-readiness-convergence-briefing-era25";
import { evaluateMonth2MarketReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-month2-market-readiness-convergence-era25";

export function evaluateScaleReadinessConvergenceEra25(
  env: NodeJS.ProcessEnv = process.env,
): {
  month2Convergence: ReturnType<typeof evaluateMonth2MarketReadinessConvergenceEra25WithMilestones>;
  scaleState: ScaleReadinessConvergenceState;
  briefingAction: ReturnType<typeof buildScaleReadinessConvergenceBriefingAction>;
  launchWizardSlice: ReturnType<typeof buildLaunchWizardScaleReadinessConvergenceSlice>;
  month2ConvergenceReady: boolean;
  convergenceBlocked: boolean;
  convergenceTargets: typeof SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS;
  humanSteps: typeof SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof SCALE_READINESS_CONVERGENCE_ERA25_DOC;
} {
  const month2Convergence = evaluateMonth2MarketReadinessConvergenceEra25WithMilestones(env);
  const scaleState = deriveScaleReadinessConvergenceState(env);
  const month2ConvergenceReady =
    month2Convergence.month2MarketReadinessConvergenceEra25Milestone ===
    "month2_market_readiness_convergence_era25_ready";

  const briefingAction = buildScaleReadinessConvergenceBriefingAction({
    month2ConvergenceReady,
    scaleState,
  });
  const launchWizardSlice = buildLaunchWizardScaleReadinessConvergenceSlice(scaleState);

  const convergenceReady = month2ConvergenceReady && scaleState.scaleComplete;
  const convergenceBlocked = !convergenceReady;

  return {
    month2Convergence,
    scaleState,
    briefingAction,
    launchWizardSlice,
    month2ConvergenceReady,
    convergenceBlocked,
    convergenceTargets: SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
    guardrails: SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  };
}
