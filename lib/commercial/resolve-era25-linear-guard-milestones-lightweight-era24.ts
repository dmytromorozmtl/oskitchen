/**
 * Resolves linear path + Step 17 guard milestones without evaluateCommercialPilotPath.
 * Breaks import cycles: era25 product slice ↔ commercial pilot path ↔ sustained product evolution.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  resolveCommercialPilotPathAbsoluteEndMilestone,
  type CommercialPilotPathAbsoluteEndMilestone,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import {
  resolveCommercialPilotPathAbsoluteEndPrerequisites,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import {
  resolveLinearChainTerminusGuardMilestone,
  type LinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  resolveLinearPathPermanentlyClosedMilestone,
  resolveMissingDocChainDocs,
  type LinearPathPermanentlyClosedMilestone,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import {
  resolveLinearPathPermanentlyClosedPrerequisites,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import {
  resolveContinuousImprovementLoopPrerequisites,
  resolveSustainedOpsCompleteForContinuousImprovement,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import { PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC } from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";

export type LinearGuardMilestonesLightweight = {
  guard: ReturnType<typeof evaluateLinearChainTerminusGuard>;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  absoluteEndMilestone: CommercialPilotPathAbsoluteEndMilestone;
};

export function resolveLinearGuardMilestonesLightweight(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): LinearGuardMilestonesLightweight {
  const guard = evaluateLinearChainTerminusGuard(root);
  const artifacts = readContinuousImprovementLoopArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const sustainedOpsComplete = resolveSustainedOpsCompleteForContinuousImprovement({
    goNoGoSummary: artifacts.goNoGoSummary,
    p0Staging: artifacts.p0Staging,
    tier2Summary: artifacts.tier2Summary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    investorOnepager: artifacts.investorOnepager,
    rollbackDrill: artifacts.rollbackDrill,
    competitorMatrix: artifacts.competitorMatrix,
    env,
  });
  const continuousImprovementLoopActive = resolveContinuousImprovementLoopPrerequisites({
    goDecision,
    sustainedOpsComplete,
  }).pureOperationalMode;
  const steadyStateActive = goDecision === "GO" && continuousImprovementLoopActive;
  const absoluteEndActive = resolveCommercialPilotPathAbsoluteEndPrerequisites({
    steadyStateActive,
  }).absoluteEndActive;
  const absoluteEndMilestone = resolveCommercialPilotPathAbsoluteEndMilestone({
    absoluteEndActive,
    steadyStateMilestone: steadyStateActive ? "steady_state_healthy" : "steady_state_blocked",
    firstBlockedStep: null,
    firstBlockedGateStep: null,
  });
  const terminalClosureActive = resolveLinearPathPermanentlyClosedPrerequisites({
    absoluteEndActive,
  }).terminalClosureActive;
  const missingDocChainDocs = resolveMissingDocChainDocs(root);
  const linearPathPermanentlyClosedMilestone = resolveLinearPathPermanentlyClosedMilestone({
    terminalClosureActive,
    absoluteEndMilestone,
    missingDocChainDocs,
    terminusGuardPassed: guard.guardPassed,
  });
  const linearChainTerminusGuardMilestone = resolveLinearChainTerminusGuardMilestone({
    linearPathPermanentlyClosedMilestone,
    guardPassed: guard.guardPassed,
  });

  return {
    guard,
    linearPathPermanentlyClosedMilestone,
    linearChainTerminusGuardMilestone,
    absoluteEndMilestone,
  };
}

export function resolveKickoffChecklistPresent(root: string = process.cwd()): boolean {
  return existsSync(join(root, PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC));
}
