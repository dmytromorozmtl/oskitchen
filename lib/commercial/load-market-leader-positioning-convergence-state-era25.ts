/**
 * Loads honest market leader positioning state for era25 convergence.
 */
import type { MarketLeaderPositioningPhaseStatus } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { evaluateMarketLeaderPositioningEnv } from "@/scripts/ops/validate-market-leader-positioning-env";

export type MarketLeaderPositioningConvergenceState = {
  goDecision: string | null;
  seriesAComplete: boolean;
  prerequisitesComplete: boolean;
  marketLeaderComplete: boolean;
  readyForMoatSmokes: boolean;
  readyForAnalystKitSmokes: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly MarketLeaderPositioningPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  envPresentCount: number;
  envMissingCount: number;
};

export function deriveMarketLeaderPositioningConvergenceState(
  env: NodeJS.ProcessEnv = process.env,
): MarketLeaderPositioningConvergenceState {
  const marketLeader = evaluateMarketLeaderPositioningEnv(env);
  const blockingPhases = marketLeader.phases.filter((phase) => !phase.optional);
  const completedBlockingCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase =
    marketLeader.phases.find((phase) => !phase.optional && !phase.complete) ??
    marketLeader.phases.find((phase) => !phase.complete) ??
    null;

  return {
    goDecision: marketLeader.goDecision,
    seriesAComplete: marketLeader.seriesAComplete,
    prerequisitesComplete: marketLeader.prerequisites.prerequisitesComplete,
    marketLeaderComplete: marketLeader.marketLeaderComplete,
    readyForMoatSmokes: marketLeader.readyForMoatSmokes,
    readyForAnalystKitSmokes: marketLeader.readyForAnalystKitSmokes,
    completedBlockingCount,
    totalBlockingCount: blockingPhases.length,
    phases: marketLeader.phases,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    envPresentCount: marketLeader.present.length,
    envMissingCount: marketLeader.missing.length,
  };
}
