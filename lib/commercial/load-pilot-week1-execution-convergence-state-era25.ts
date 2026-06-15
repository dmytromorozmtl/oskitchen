/**
 * Loads honest Pilot Week 1 execution state for era25 convergence.
 */
import type { PilotWeek1ExecutionPhaseStatus } from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";

export type PilotWeek1ExecutionConvergenceState = {
  goDecision: string | null;
  prerequisitesComplete: boolean;
  week1Complete: boolean;
  readyForDay5Smokes: boolean;
  completedPhaseCount: number;
  totalPhaseCount: number;
  phases: readonly PilotWeek1ExecutionPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  envPresentCount: number;
  envMissingCount: number;
};

export function derivePilotWeek1ExecutionConvergenceState(
  env: NodeJS.ProcessEnv = process.env,
): PilotWeek1ExecutionConvergenceState {
  const week1 = evaluatePilotWeek1Env(env);
  const completedPhaseCount = week1.phases.filter((phase) => phase.complete).length;
  const nextPhase = week1.phases.find((phase) => !phase.complete) ?? null;

  return {
    goDecision: week1.goDecision,
    prerequisitesComplete: week1.prerequisites.prerequisitesComplete,
    week1Complete: week1.week1Complete,
    readyForDay5Smokes: week1.readyForDay5Smokes,
    completedPhaseCount,
    totalPhaseCount: week1.phases.length,
    phases: week1.phases,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    envPresentCount: week1.present.length,
    envMissingCount: week1.missing.length,
  };
}
