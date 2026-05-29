/**
 * era25 Pure Operational Mode Terminus evaluation.
 */
import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
} from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import {
  derivePureOperationalModeTerminusState,
  type PureOperationalModeTerminusState,
} from "@/lib/commercial/load-pure-operational-mode-terminus-state-era25";
import { resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv } from "@/lib/commercial/era25-convergence-milestones-from-env-era25";
import { resolvePureOperationalModeTerminusEra25Milestone } from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";

export function evaluatePureOperationalModeTerminusEra25(
  env: NodeJS.ProcessEnv = process.env,
): {
  sustainedOperationalExcellenceConvergenceEra25Milestone: ReturnType<
    typeof resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv
  >;
  /** @deprecated Use sustainedOperationalExcellenceConvergenceEra25Milestone — compat shim */
  sustainedOpsConvergence: {
    sustainedOperationalExcellenceConvergenceEra25Milestone: ReturnType<
      typeof resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv
    >;
  };
  terminusState: PureOperationalModeTerminusState;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  terminusBlocked: boolean;
  convergenceTargets: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS;
  guardrails: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS;
  humanSteps: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS;
  convergenceDoc: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC;
} {
  const sustainedOperationalExcellenceConvergenceEra25Milestone =
    resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv(env);
  const terminusState = derivePureOperationalModeTerminusState(env);
  const sustainedOpsConvergenceReady = terminusState.sustainedOpsConvergenceReady;

  const milestone = resolvePureOperationalModeTerminusEra25Milestone({
    sustainedOperationalExcellenceConvergenceEra25Milestone,
    sustainedOpsConvergenceReady,
    tracks: terminusState.tracks,
  });
  const pureOperationalModeEra25Active = milestone === "pure_operational_mode_era25_active";
  const terminusBlocked = !pureOperationalModeEra25Active;

  return {
    sustainedOperationalExcellenceConvergenceEra25Milestone,
    sustainedOpsConvergence: {
      sustainedOperationalExcellenceConvergenceEra25Milestone,
    },
    terminusState,
    sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active,
    terminusBlocked,
    convergenceTargets: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS,
    guardrails: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
    humanSteps: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
    convergenceDoc: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
  };
}
