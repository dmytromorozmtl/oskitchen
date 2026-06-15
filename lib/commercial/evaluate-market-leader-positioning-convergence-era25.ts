/**
 * era25 Market Leader Positioning Convergence evaluation.
 */
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import {
  deriveMarketLeaderPositioningConvergenceState,
  type MarketLeaderPositioningConvergenceState,
} from "@/lib/commercial/load-market-leader-positioning-convergence-state-era25";
import {
  buildLaunchWizardMarketLeaderPositioningConvergenceSlice,
  buildMarketLeaderPositioningConvergenceBriefingAction,
} from "@/lib/briefing/market-leader-positioning-convergence-briefing-era25";
import { evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones } from "@/scripts/ops/validate-series-a-partner-expansion-convergence-era25";

export function evaluateMarketLeaderPositioningConvergenceEra25(
  env: NodeJS.ProcessEnv = process.env,
): {
  seriesAConvergence: ReturnType<typeof evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones>;
  marketLeaderState: MarketLeaderPositioningConvergenceState;
  briefingAction: ReturnType<typeof buildMarketLeaderPositioningConvergenceBriefingAction>;
  launchWizardSlice: ReturnType<typeof buildLaunchWizardMarketLeaderPositioningConvergenceSlice>;
  seriesAConvergenceReady: boolean;
  convergenceBlocked: boolean;
  convergenceTargets: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS;
  humanSteps: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC;
} {
  const seriesAConvergence = evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones(env);
  const marketLeaderState = deriveMarketLeaderPositioningConvergenceState(env);
  const seriesAConvergenceReady =
    seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone ===
    "series_a_partner_expansion_convergence_era25_ready";

  const briefingAction = buildMarketLeaderPositioningConvergenceBriefingAction({
    seriesAConvergenceReady,
    marketLeaderState,
  });
  const launchWizardSlice = buildLaunchWizardMarketLeaderPositioningConvergenceSlice(marketLeaderState);

  const convergenceReady = seriesAConvergenceReady && marketLeaderState.marketLeaderComplete;
  const convergenceBlocked = !convergenceReady;

  return {
    seriesAConvergence,
    marketLeaderState,
    briefingAction,
    launchWizardSlice,
    seriesAConvergenceReady,
    convergenceBlocked,
    convergenceTargets: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
    guardrails: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
  };
}
