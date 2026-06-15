/**
 * era25 Series A / Partner Expansion Convergence evaluation.
 */
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import {
  deriveSeriesAPartnerExpansionConvergenceState,
  type SeriesAPartnerExpansionConvergenceState,
} from "@/lib/commercial/load-series-a-partner-expansion-convergence-state-era25";
import {
  buildLaunchWizardSeriesAPartnerExpansionConvergenceSlice,
  buildSeriesAPartnerExpansionConvergenceBriefingAction,
} from "@/lib/briefing/series-a-partner-expansion-convergence-briefing-era25";
import { evaluateScaleReadinessConvergenceEra25WithMilestones } from "@/scripts/ops/validate-scale-readiness-convergence-era25";

export function evaluateSeriesAPartnerExpansionConvergenceEra25(
  env: NodeJS.ProcessEnv = process.env,
): {
  scaleConvergence: ReturnType<typeof evaluateScaleReadinessConvergenceEra25WithMilestones>;
  seriesAState: SeriesAPartnerExpansionConvergenceState;
  briefingAction: ReturnType<typeof buildSeriesAPartnerExpansionConvergenceBriefingAction>;
  launchWizardSlice: ReturnType<typeof buildLaunchWizardSeriesAPartnerExpansionConvergenceSlice>;
  scaleConvergenceReady: boolean;
  convergenceBlocked: boolean;
  convergenceTargets: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS;
  humanSteps: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC;
} {
  const scaleConvergence = evaluateScaleReadinessConvergenceEra25WithMilestones(env);
  const seriesAState = deriveSeriesAPartnerExpansionConvergenceState(env);
  const scaleConvergenceReady =
    scaleConvergence.scaleReadinessConvergenceEra25Milestone ===
    "scale_readiness_convergence_era25_ready";

  const briefingAction = buildSeriesAPartnerExpansionConvergenceBriefingAction({
    scaleConvergenceReady,
    seriesAState,
  });
  const launchWizardSlice = buildLaunchWizardSeriesAPartnerExpansionConvergenceSlice(seriesAState);

  const convergenceReady = scaleConvergenceReady && seriesAState.seriesAComplete;
  const convergenceBlocked = !convergenceReady;

  return {
    scaleConvergence,
    seriesAState,
    briefingAction,
    launchWizardSlice,
    scaleConvergenceReady,
    convergenceBlocked,
    convergenceTargets: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
    guardrails: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
  };
}
