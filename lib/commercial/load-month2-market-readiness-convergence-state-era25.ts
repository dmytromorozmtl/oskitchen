/**
 * Loads honest Month 2 market readiness state for era25 convergence.
 */
import type { Month2MarketReadinessPhaseStatus } from "@/lib/commercial/month2-market-readiness-phases-era21";
import {
  evaluateMonth2MarketReadinessEnv,
  readMonth2MarketReadinessArtifacts,
} from "@/scripts/ops/validate-month2-market-readiness-env";

export type Month2MarketReadinessConvergenceState = {
  goDecision: string | null;
  week1Complete: boolean;
  prerequisitesComplete: boolean;
  month2Complete: boolean;
  readyForInvestorOnepagerSmoke: boolean;
  metricsBaselinePassed: boolean;
  caseStudyInternalReady: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly Month2MarketReadinessPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  envPresentCount: number;
  envMissingCount: number;
};

export function deriveMonth2MarketReadinessConvergenceState(
  env: NodeJS.ProcessEnv = process.env,
): Month2MarketReadinessConvergenceState {
  const month2 = evaluateMonth2MarketReadinessEnv(env);
  const artifacts = readMonth2MarketReadinessArtifacts();
  const blockingPhases = month2.phases.filter((phase) => !phase.optional);
  const completedBlockingCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase =
    month2.phases.find((phase) => !phase.optional && !phase.complete) ??
    month2.phases.find((phase) => !phase.complete) ??
    null;

  return {
    goDecision: month2.goDecision,
    week1Complete: month2.week1Complete,
    prerequisitesComplete: month2.prerequisites.prerequisitesComplete,
    month2Complete: month2.month2Complete,
    readyForInvestorOnepagerSmoke: month2.readyForInvestorOnepagerSmoke,
    metricsBaselinePassed: artifacts.metricsBaseline?.overall === "PASSED",
    caseStudyInternalReady:
      artifacts.caseStudyDraft?.caseStudyProofStatus === "internal_draft_ready",
    completedBlockingCount,
    totalBlockingCount: blockingPhases.length,
    phases: month2.phases,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    envPresentCount: month2.present.length,
    envMissingCount: month2.missing.length,
  };
}
