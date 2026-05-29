/**
 * era25 Sustained Operational Excellence Convergence evaluation.
 */
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import {
  deriveSustainedOperationalExcellenceConvergenceState,
  type SustainedOperationalExcellenceConvergenceState,
} from "@/lib/commercial/load-sustained-operational-excellence-convergence-state-era25";
import {
  buildLaunchWizardSustainedOperationalExcellenceConvergenceSlice,
  buildSustainedOperationalExcellenceConvergenceBriefingAction,
} from "@/lib/briefing/sustained-operational-excellence-convergence-briefing-era25";
import { evaluateMarketLeaderPositioningConvergenceEra25WithMilestones } from "@/scripts/ops/validate-market-leader-positioning-convergence-era25";

export function evaluateSustainedOperationalExcellenceConvergenceEra25(
  env: NodeJS.ProcessEnv = process.env,
): {
  marketLeaderConvergence: ReturnType<typeof evaluateMarketLeaderPositioningConvergenceEra25WithMilestones>;
  sustainedOpsState: SustainedOperationalExcellenceConvergenceState;
  briefingAction: ReturnType<typeof buildSustainedOperationalExcellenceConvergenceBriefingAction>;
  launchWizardSlice: ReturnType<typeof buildLaunchWizardSustainedOperationalExcellenceConvergenceSlice>;
  marketLeaderConvergenceReady: boolean;
  convergenceBlocked: boolean;
  convergenceTargets: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS;
  humanSteps: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC;
} {
  const marketLeaderConvergence = evaluateMarketLeaderPositioningConvergenceEra25WithMilestones(env);
  const sustainedOpsState = deriveSustainedOperationalExcellenceConvergenceState(env);
  const marketLeaderConvergenceReady =
    marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone ===
    "market_leader_positioning_convergence_era25_ready";

  const briefingAction = buildSustainedOperationalExcellenceConvergenceBriefingAction({
    marketLeaderConvergenceReady,
    sustainedOpsState,
  });
  const launchWizardSlice =
    buildLaunchWizardSustainedOperationalExcellenceConvergenceSlice(sustainedOpsState);

  const convergenceReady = marketLeaderConvergenceReady && sustainedOpsState.sustainedOpsComplete;
  const convergenceBlocked = !convergenceReady;

  return {
    marketLeaderConvergence,
    sustainedOpsState,
    briefingAction,
    launchWizardSlice,
    marketLeaderConvergenceReady,
    convergenceBlocked,
    convergenceTargets: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
    guardrails: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
    humanSteps: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
    convergenceDoc: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
  };
}
