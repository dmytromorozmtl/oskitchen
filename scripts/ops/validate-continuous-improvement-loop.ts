#!/usr/bin/env npx tsx
/**
 * Validates continuous improvement loop health (Step 10, informational — never blocks release).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildContinuousImprovementLoopTrackStatuses,
  resolveContinuousImprovementLoopHealthSummary,
  resolveContinuousImprovementLoopPrerequisites,
  resolveSustainedOpsCompleteForContinuousImprovement,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";

function readJson<T>(path: string): T | null {
  const full = join(process.cwd(), path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readContinuousImprovementLoopArtifacts(): {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill: PilotRollbackDrillSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
} {
  return {
    goNoGoSummary: readJson<PilotGoNoGoSummary>(PILOT_GONOGO_SUMMARY_ARTIFACT_PATH),
    p0Staging: readJson<P0StagingProofUnblockSummary>(P0_STAGING_PROOF_ARTIFACT_PATH),
    tier2Summary: readJson<Tier2StagingGoldenPathSummary>(TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH),
    metricsBaseline: readJson<PilotMetricsBaselineSummary>(PILOT_METRICS_BASELINE_ARTIFACT_PATH),
    caseStudyDraft: readJson<PilotCaseStudyDraftSummary>(PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH),
    investorOnepager: readJson<InvestorNarrativeOnepagerSummary>(
      INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
    ),
    rollbackDrill: readJson<PilotRollbackDrillSummary>(PILOT_ROLLBACK_DRILL_ARTIFACT_PATH),
    competitorMatrix: readJson<CompetitorFeatureGapMatrixSummary>(
      COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
    ),
  };
}

export function evaluateContinuousImprovementLoop(
  env: NodeJS.ProcessEnv = process.env,
): {
  prerequisites: ReturnType<typeof resolveContinuousImprovementLoopPrerequisites>;
  sustainedOpsComplete: boolean;
  goDecision: string | null;
  pureOperationalMode: boolean;
  tracks: ReturnType<typeof buildContinuousImprovementLoopTrackStatuses>;
  health: ReturnType<typeof resolveContinuousImprovementLoopHealthSummary>;
} {
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
  const prerequisites = resolveContinuousImprovementLoopPrerequisites({
    goDecision,
    sustainedOpsComplete,
  });
  const tracks = buildContinuousImprovementLoopTrackStatuses({
    p0Staging: artifacts.p0Staging,
    tier2Summary: artifacts.tier2Summary,
    metricsBaseline: artifacts.metricsBaseline,
    competitorMatrix: artifacts.competitorMatrix,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
  });
  const health = resolveContinuousImprovementLoopHealthSummary(tracks);

  return {
    prerequisites,
    sustainedOpsComplete,
    goDecision,
    pureOperationalMode: prerequisites.pureOperationalMode,
    tracks,
    health,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateContinuousImprovementLoop();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era22-continuous-improvement-loop-v1",
          pureOperationalMode: result.pureOperationalMode,
          sustainedOpsComplete: result.sustainedOpsComplete,
          goDecision: result.goDecision,
          health: result.health,
          tracks: result.tracks.map((track) => ({
            id: track.id,
            label: track.label,
            frequency: track.frequency,
            status: track.status,
            detail: track.detail,
            lastRunAt: track.lastRunAt,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(`\nContinuous improvement loop (era22-continuous-improvement-loop-v1)\n`);

  if (!result.pureOperationalMode) {
    console.log(
      "Not in pure operational mode — complete Sustained ops (Step 9) first, then re-run.\n",
    );
    console.log(`  sustainedOpsComplete: ${result.sustainedOpsComplete}`);
    console.log(`  goDecision: ${result.goDecision ?? "missing"}\n`);
    process.exit(0);
  }

  console.log(`Pure operational mode active · GO · ${result.health.overdueCount} overdue track(s)\n`);

  for (const track of result.tracks) {
    console.log(`[${track.status}] ${track.label}`);
    console.log(`  ${track.detail}\n`);
  }

  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
