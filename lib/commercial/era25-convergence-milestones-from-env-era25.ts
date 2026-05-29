/**
 * Resolves era25 convergence milestones from env attestations + lib evaluators.
 * Avoids validate-script cycles through commercial pilot path.
 */
import { loadP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  resolveEra25CharterExitMilestone,
  type Era25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import {
  resolveEra25EngineeringGatesMilestone,
  type Era25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import {
  resolveEra25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import {
  resolveEra25FirstProductSliceBlueprintMilestone,
  type Era25FirstProductSliceBlueprintMilestone,
} from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import { discoverIllegalEra25ProductArtifacts } from "@/lib/commercial/detect-illegal-era25-product-artifacts-era24";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { ERA_CHARTER_READINESS_CHECKLIST_PATH } from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import { evaluateEra25CharterExitOutsideLinearPath } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";
import { validateFirstEra25CharterDocSections } from "@/lib/commercial/validate-era25-charter-doc-sections-era24";
import { evaluateEra25FirstProductSliceBlueprint } from "@/lib/commercial/evaluate-era25-first-product-slice-blueprint";
import {
  allBreakthroughBriefingTilesWired,
  buildOwnerDailyBriefingBreakthroughEra25Tiles,
} from "@/lib/briefing/owner-daily-briefing-breakthrough-era25";
import { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME } from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import {
  resolveOwnerDailyBriefingBreakthroughEra25Milestone,
  type OwnerDailyBriefingBreakthroughEra25Milestone,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import {
  resolvePaidPilotGoConvergenceEra25Milestone,
  type PaidPilotGoConvergenceEra25Milestone,
} from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import {
  resolvePilotWeek1ExecutionConvergenceEra25Milestone,
  type PilotWeek1ExecutionConvergenceEra25Milestone,
} from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import {
  resolveMonth2MarketReadinessConvergenceEra25Milestone,
  type Month2MarketReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import {
  resolveScaleReadinessConvergenceEra25Milestone,
  type ScaleReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import {
  resolveSeriesAPartnerExpansionConvergenceEra25Milestone,
  type SeriesAPartnerExpansionConvergenceEra25Milestone,
} from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import {
  resolveMarketLeaderPositioningConvergenceEra25Milestone,
  type MarketLeaderPositioningConvergenceEra25Milestone,
} from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import {
  resolveSustainedOperationalExcellenceConvergenceEra25Milestone,
  type SustainedOperationalExcellenceConvergenceEra25Milestone,
} from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import {
  resolvePureOperationalModeTerminusEra25Milestone,
  type PureOperationalModeTerminusEra25Milestone,
} from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import { derivePureOperationalModeTerminusState } from "@/lib/commercial/load-pure-operational-mode-terminus-state-era25";
import { derivePaidPilotGoConvergenceState } from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";
import { derivePilotWeek1ExecutionConvergenceState } from "@/lib/commercial/load-pilot-week1-execution-convergence-state-era25";
import { deriveMonth2MarketReadinessConvergenceState } from "@/lib/commercial/load-month2-market-readiness-convergence-state-era25";
import { deriveScaleReadinessConvergenceState } from "@/lib/commercial/load-scale-readiness-convergence-state-era25";
import { deriveSeriesAPartnerExpansionConvergenceState } from "@/lib/commercial/load-series-a-partner-expansion-convergence-state-era25";
import { deriveMarketLeaderPositioningConvergenceState } from "@/lib/commercial/load-market-leader-positioning-convergence-state-era25";
import { deriveSustainedOperationalExcellenceConvergenceState } from "@/lib/commercial/load-sustained-operational-excellence-convergence-state-era25";
import {
  resolveKickoffChecklistPresent,
  resolveLinearGuardMilestonesLightweight,
} from "@/lib/commercial/resolve-era25-linear-guard-milestones-lightweight-era24";
import { discoverEra25CharterDocs } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";

export function resolveEra25CharterExitMilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): Era25CharterExitMilestone {
  const linearGuard = resolveLinearGuardMilestonesLightweight(env, root);
  const era25CharterDocs = discoverEra25CharterDocs(root);
  const signedCharterPresent = era25CharterDocs.length > 0;

  return resolveEra25CharterExitMilestone({
    linearChainTerminusGuardMilestone: linearGuard.linearChainTerminusGuardMilestone,
    guardPassed: linearGuard.guard.guardPassed,
    charterChecklistPresent: existsSync(join(root, ERA_CHARTER_READINESS_CHECKLIST_PATH)),
    signedCharterPresent,
  });
}

export function resolveEra25FirstCharterSliceReadinessMilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): ReturnType<typeof resolveEra25FirstCharterSliceReadinessMilestone> {
  const charterExit = evaluateEra25CharterExitOutsideLinearPath(env, root);
  const charterValidation = validateFirstEra25CharterDocSections(root);
  const era25CharterExitMilestone = resolveEra25CharterExitMilestoneFromEnv(env, root);

  return resolveEra25FirstCharterSliceReadinessMilestone({
    era25CharterExitMilestone,
    signedCharterPresent: charterExit.signedCharterPresent,
    sectionsValid: charterValidation.sectionsValid,
  });
}

export function resolveEra25EngineeringGatesMilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): Era25EngineeringGatesMilestone {
  const readinessMilestone = resolveEra25FirstCharterSliceReadinessMilestoneFromEnv(env, root);
  const illegalArtifactCount = discoverIllegalEra25ProductArtifacts(root).length;

  return resolveEra25EngineeringGatesMilestone({
    era25FirstCharterSliceReadinessMilestone: readinessMilestone,
    illegalArtifactCount,
  });
}

export function resolveEra25FirstProductSliceBlueprintMilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): Era25FirstProductSliceBlueprintMilestone {
  const evaluation = evaluateEra25FirstProductSliceBlueprint(env, root);
  const gatesMilestone = resolveEra25EngineeringGatesMilestoneFromEnv(env, root);

  return resolveEra25FirstProductSliceBlueprintMilestone({
    era25EngineeringGatesMilestone: gatesMilestone,
    gatesBlocked: evaluation.blueprintBlocked || gatesMilestone !== "era25_engineering_gates_open",
    illegalArtifactCount: evaluation.illegalArtifacts.length,
    canonicalCharterDocPath: evaluation.canonicalCharterDocPath,
    charterSectionsValid: evaluation.charterSectionsValid,
    stagingChecklistSectionsValid: evaluation.stagingChecklist.sectionsValid,
  });
}

export function resolveOwnerDailyBriefingBreakthroughEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): OwnerDailyBriefingBreakthroughEra25Milestone {
  const blueprintMilestone = resolveEra25FirstProductSliceBlueprintMilestoneFromEnv(env, root);
  const p0Artifact = loadP0StagingProofUnblockSummary(root);
  const p0ProofStatus = p0Artifact?.p0ProofStatus ?? "awaiting_ops_credentials";
  const goState = derivePaidPilotGoConvergenceState(root);
  const briefingTiles = buildOwnerDailyBriefingBreakthroughEra25Tiles({
    blueprintMilestone,
    gatesMilestone: resolveEra25EngineeringGatesMilestoneFromEnv(env, root),
    blueprintBlocked: blueprintMilestone !== "era25_first_product_slice_blueprint_ready",
    p0ProofStatus,
    briefingSchemeCount: OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_BRIEFING_SCHEME.length,
    goState,
  });

  return resolveOwnerDailyBriefingBreakthroughEra25Milestone({
    era25FirstProductSliceBlueprintMilestone: blueprintMilestone,
    allBriefingTilesWired: allBreakthroughBriefingTilesWired(briefingTiles),
    p0ProofStatus,
  });
}

export function resolvePaidPilotGoConvergenceEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): PaidPilotGoConvergenceEra25Milestone {
  const goState = derivePaidPilotGoConvergenceState(root);

  return resolvePaidPilotGoConvergenceEra25Milestone({
    ownerDailyBriefingBreakthroughEra25Milestone:
      resolveOwnerDailyBriefingBreakthroughEra25MilestoneFromEnv(env, root),
    icpQualified: goState.icpQualified,
    loiRecorded: goState.loiRecorded,
    forbiddenClaimsPassed: goState.forbiddenClaimsPassed,
    kickoffChecklistPresent: resolveKickoffChecklistPresent(root),
    goDecision: goState.decision,
  });
}

export function resolvePilotWeek1ExecutionConvergenceEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): PilotWeek1ExecutionConvergenceEra25Milestone {
  const week1State = derivePilotWeek1ExecutionConvergenceState(env);

  return resolvePilotWeek1ExecutionConvergenceEra25Milestone({
    paidPilotGoConvergenceEra25Milestone: resolvePaidPilotGoConvergenceEra25MilestoneFromEnv(
      env,
      root,
    ),
    week1Complete: week1State.week1Complete,
    nextPhaseId: week1State.nextPhaseId,
  });
}

export function resolveMonth2MarketReadinessConvergenceEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): Month2MarketReadinessConvergenceEra25Milestone {
  const month2State = deriveMonth2MarketReadinessConvergenceState(env);

  return resolveMonth2MarketReadinessConvergenceEra25Milestone({
    pilotWeek1ExecutionConvergenceEra25Milestone:
      resolvePilotWeek1ExecutionConvergenceEra25MilestoneFromEnv(env),
    month2Complete: month2State.month2Complete,
    metricsBaselinePassed: month2State.metricsBaselinePassed,
    phases: month2State.phases,
  });
}

export function resolveScaleReadinessConvergenceEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): ScaleReadinessConvergenceEra25Milestone {
  const scaleState = deriveScaleReadinessConvergenceState(env);

  return resolveScaleReadinessConvergenceEra25Milestone({
    month2MarketReadinessConvergenceEra25Milestone:
      resolveMonth2MarketReadinessConvergenceEra25MilestoneFromEnv(env),
    scaleComplete: scaleState.scaleComplete,
    phases: scaleState.phases,
  });
}

export function resolveSeriesAPartnerExpansionConvergenceEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): SeriesAPartnerExpansionConvergenceEra25Milestone {
  const seriesAState = deriveSeriesAPartnerExpansionConvergenceState(env);

  return resolveSeriesAPartnerExpansionConvergenceEra25Milestone({
    scaleReadinessConvergenceEra25Milestone: resolveScaleReadinessConvergenceEra25MilestoneFromEnv(env),
    seriesAComplete: seriesAState.seriesAComplete,
    phases: seriesAState.phases,
  });
}

export function resolveMarketLeaderPositioningConvergenceEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): MarketLeaderPositioningConvergenceEra25Milestone {
  const marketLeaderState = deriveMarketLeaderPositioningConvergenceState(env);

  return resolveMarketLeaderPositioningConvergenceEra25Milestone({
    seriesAPartnerExpansionConvergenceEra25Milestone:
      resolveSeriesAPartnerExpansionConvergenceEra25MilestoneFromEnv(env),
    marketLeaderComplete: marketLeaderState.marketLeaderComplete,
    phases: marketLeaderState.phases,
  });
}

export function resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): SustainedOperationalExcellenceConvergenceEra25Milestone {
  const sustainedOpsState = deriveSustainedOperationalExcellenceConvergenceState(env);

  return resolveSustainedOperationalExcellenceConvergenceEra25Milestone({
    marketLeaderPositioningConvergenceEra25Milestone:
      resolveMarketLeaderPositioningConvergenceEra25MilestoneFromEnv(env),
    sustainedOpsComplete: sustainedOpsState.sustainedOpsComplete,
    phases: sustainedOpsState.phases,
  });
}

export function resolvePureOperationalModeTerminusEra25MilestoneFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): PureOperationalModeTerminusEra25Milestone {
  const terminusState = derivePureOperationalModeTerminusState(env);

  return resolvePureOperationalModeTerminusEra25Milestone({
    sustainedOperationalExcellenceConvergenceEra25Milestone:
      resolveSustainedOperationalExcellenceConvergenceEra25MilestoneFromEnv(env),
    sustainedOpsConvergenceReady: terminusState.sustainedOpsConvergenceReady,
    tracks: terminusState.tracks,
  });
}
