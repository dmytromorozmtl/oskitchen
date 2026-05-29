/**
 * Loads honest Series A / partner expansion state for era25 convergence.
 */
import type { SeriesAPartnerExpansionPhaseStatus } from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { evaluateSeriesAPartnerExpansionEnv } from "@/scripts/ops/validate-series-a-partner-expansion-env";

export type SeriesAPartnerExpansionConvergenceState = {
  goDecision: string | null;
  scaleComplete: boolean;
  prerequisitesComplete: boolean;
  seriesAComplete: boolean;
  readyForDataRoomSmokes: boolean;
  readyForPartnerSmokes: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly SeriesAPartnerExpansionPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  envPresentCount: number;
  envMissingCount: number;
};

export function deriveSeriesAPartnerExpansionConvergenceState(
  env: NodeJS.ProcessEnv = process.env,
): SeriesAPartnerExpansionConvergenceState {
  const seriesA = evaluateSeriesAPartnerExpansionEnv(env);
  const blockingPhases = seriesA.phases.filter((phase) => !phase.optional);
  const completedBlockingCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase =
    seriesA.phases.find((phase) => !phase.optional && !phase.complete) ??
    seriesA.phases.find((phase) => !phase.complete) ??
    null;

  return {
    goDecision: seriesA.goDecision,
    scaleComplete: seriesA.scaleComplete,
    prerequisitesComplete: seriesA.prerequisites.prerequisitesComplete,
    seriesAComplete: seriesA.seriesAComplete,
    readyForDataRoomSmokes: seriesA.readyForDataRoomSmokes,
    readyForPartnerSmokes: seriesA.readyForPartnerSmokes,
    completedBlockingCount,
    totalBlockingCount: blockingPhases.length,
    phases: seriesA.phases,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    envPresentCount: seriesA.present.length,
    envMissingCount: seriesA.missing.length,
  };
}
