/**
 * Master commercial pilot path evaluation — orchestrates Steps 1–16 validators.
 */
import {
  buildCommercialPilotPathStepStatuses,
  resolveCommercialPilotPathSummary,
  type CommercialPilotPathStepStatus,
  type CommercialPilotPathSummary,
} from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import { evaluateCommercialGoClosureEnv } from "@/scripts/ops/validate-commercial-go-closure-env";
import { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";
import { evaluateMarketLeaderPositioningEnv } from "@/scripts/ops/validate-market-leader-positioning-env";
import { evaluateMonth2MarketReadinessEnv } from "@/scripts/ops/validate-month2-market-readiness-env";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";
import { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";
import { evaluateScaleReadinessEnv } from "@/scripts/ops/validate-scale-readiness-env";
import { evaluateSeriesAPartnerExpansionEnv } from "@/scripts/ops/validate-series-a-partner-expansion-env";
import { evaluateSustainedOperationalExcellenceEnv } from "@/scripts/ops/validate-sustained-operational-excellence-env";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";
import { evaluateTier2GoldenPathEnv } from "@/scripts/ops/validate-tier2-golden-path-env";

export function evaluateCommercialPilotPath(env: NodeJS.ProcessEnv = process.env): {
  steps: CommercialPilotPathStepStatus[];
  summary: CommercialPilotPathSummary;
} {
  const p0Vault = evaluateP0VaultEnv(env);
  const tier2 = evaluateTier2GoldenPathEnv(env);
  const commercialGo = evaluateCommercialGoClosureEnv(env);
  const pilotWeek1 = evaluatePilotWeek1Env(env);
  const month2 = evaluateMonth2MarketReadinessEnv(env);
  const scale = evaluateScaleReadinessEnv(env);
  const seriesA = evaluateSeriesAPartnerExpansionEnv(env);
  const marketLeader = evaluateMarketLeaderPositioningEnv(env);
  const sustainedOps = evaluateSustainedOperationalExcellenceEnv(env);
  const improvementLoop = evaluateContinuousImprovementLoop(env);
  const productEvolution = evaluateSustainedProductEvolution(env);
  const maintenanceMode = evaluateMaintenanceMode(env);
  const steadyState = evaluateSteadyStateOperatorLoop(env);

  const stepsRaw = buildCommercialPilotPathStepStatuses({
    p0Vault,
    tier2,
    commercialGo: {
      phases: commercialGo.phases,
      decision: commercialGo.decision,
      missing: commercialGo.missing,
    },
    pilotWeek1,
    month2,
    scale,
    seriesA,
    marketLeader,
    sustainedOps,
    improvementLoop,
    productEvolution,
    maintenanceMode: {
      maintenanceModeActive: maintenanceMode.maintenanceModeActive,
      commercialPilotPathComplete: maintenanceMode.commercialPilotPathComplete,
      goDecision: maintenanceMode.goDecision,
    },
    steadyState: {
      steadyStateActive: steadyState.steadyStateActive,
      engineeringTerminusActive: steadyState.engineeringTerminusActive,
      overdueTracks: steadyState.health.overdueCount,
    },
    absoluteEnd: {
      absoluteEndActive: steadyState.steadyStateActive,
      pathEngineeringClosed: true,
      completedSteps: 0,
      totalSteps: 16,
      goDecision: maintenanceMode.goDecision,
    },
    terminalClosure: {
      terminalClosureActive: steadyState.steadyStateActive,
      linearPathPermanentlyClosed: true,
      docChainSteps: 16,
    },
  });

  const completedSteps = stepsRaw.filter((step) => step.complete).length;
  const steps = stepsRaw.map((step) => {
    if (step.id === "commercial_pilot_path_absolute_end") {
      return {
        ...step,
        detail: steadyState.steadyStateActive
          ? `Linear path closed · ${completedSteps}/${stepsRaw.length} steps · era25+ requires charter`
          : "Complete Step 14 post-terminus steady state first",
      };
    }
    if (step.id === "linear_path_permanently_closed") {
      return {
        ...step,
        detail: steadyState.steadyStateActive
          ? `Doc chain complete · 16 steps · Step 17+ forbidden in this chain`
          : "Complete Step 15 absolute end first",
      };
    }
    return step;
  });

  const summary = resolveCommercialPilotPathSummary(
    steps,
    {
      maintenanceModeActive: maintenanceMode.maintenanceModeActive,
      commercialPilotPathComplete: maintenanceMode.commercialPilotPathComplete,
      goDecision: maintenanceMode.goDecision,
    },
    {
      steadyStateActive: steadyState.steadyStateActive,
      engineeringTerminusActive: steadyState.engineeringTerminusActive,
      overdueTracks: steadyState.health.overdueCount,
    },
    {
      absoluteEndActive: steadyState.steadyStateActive,
      pathEngineeringClosed: true,
      completedSteps,
      totalSteps: steps.length,
      goDecision: maintenanceMode.goDecision,
    },
    {
      terminalClosureActive: steadyState.steadyStateActive,
      linearPathPermanentlyClosed: true,
      docChainSteps: 16,
    },
  );

  return { steps, summary };
}
