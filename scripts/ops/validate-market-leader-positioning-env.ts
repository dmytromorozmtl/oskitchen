#!/usr/bin/env npx tsx
/**
 * Validates Market leader positioning env + artifact pillars (Step 8).
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
import { resolveMarketLeaderPositioningMilestone } from "@/lib/commercial/market-leader-positioning-post-series-a-orchestrator-era21";
import {
  buildMarketLeaderPositioningPhaseStatuses,
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MARKET_LEADER_POSITIONING_TRACKED_ENV_KEYS,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveMarketLeaderPositioningComplete,
  resolveMarketLeaderPositioningPrerequisites,
  resolveSeriesACompleteForMarketLeader,
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

export function readMarketLeaderPositioningArtifacts(): {
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

export function evaluateMarketLeaderPositioningEnv(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveMarketLeaderPositioningPrerequisites>;
  seriesAComplete: boolean;
  present: string[];
  missing: string[];
  phases: ReturnType<typeof buildMarketLeaderPositioningPhaseStatuses>;
  goDecision: string | null;
  marketLeaderComplete: boolean;
  readyForMoatSmokes: boolean;
  readyForAnalystKitSmokes: boolean;
  marketLeaderMilestone: ReturnType<typeof resolveMarketLeaderPositioningMilestone>;
} {
  const artifacts = readMarketLeaderPositioningArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const seriesAComplete = resolveSeriesACompleteForMarketLeader({
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
  const prerequisites = resolveMarketLeaderPositioningPrerequisites({
    goDecision,
    seriesAComplete,
  });
  const present = MARKET_LEADER_POSITIONING_TRACKED_ENV_KEYS.filter((key) =>
    Boolean(env[key]?.trim()),
  );
  const missing = MARKET_LEADER_POSITIONING_TRACKED_ENV_KEYS.filter((key) => !env[key]?.trim());
  const phases = buildMarketLeaderPositioningPhaseStatuses({
    prerequisites,
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
  const marketLeaderComplete = resolveMarketLeaderPositioningComplete(phases);
  const pillar2 = phases.find((phase) => phase.id === "pillar2_competitive_moat_proof");
  const pillar3 = phases.find((phase) => phase.id === "pillar3_analyst_press_kit");
  const p0Passed = artifacts.p0Staging?.p0ProofStatus === "proof_passed";
  const tier2Passed = artifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const rollbackPassed = artifacts.rollbackDrill?.rollbackProofStatus === "proof_passed";
  const week1Ttv = Boolean(env.PILOT_WEEK1_TTV_HOURS?.trim());
  const posCloseout = env.PILOT_WEEK1_POS_CLOSEOUT_STATUS?.trim().toLowerCase() === "pass";
  const moatEvidence = p0Passed && tier2Passed && rollbackPassed && week1Ttv && posCloseout;
  const dataRoomBundle = Boolean(env.SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED?.trim());
  const investorReady =
    artifacts.investorOnepager?.overall === "PASSED" &&
    artifacts.investorOnepager.narrativeProofStatus === "proof_ready_with_metrics";
  const competitorAligned =
    artifacts.competitorMatrix?.overall === "PASSED" &&
    artifacts.competitorMatrix.matrixProofStatus === "evidence_aligned_era17";
  const readyForMoatSmokes =
    prerequisites.prerequisitesComplete &&
    !marketLeaderComplete &&
    pillar2?.complete !== true &&
    !moatEvidence;
  const readyForAnalystKitSmokes =
    prerequisites.prerequisitesComplete &&
    !marketLeaderComplete &&
    pillar3?.complete !== true &&
    dataRoomBundle &&
    (!investorReady || !competitorAligned);
  const marketLeaderMilestone = resolveMarketLeaderPositioningMilestone({
    prerequisitesComplete: prerequisites.prerequisitesComplete,
    seriesAComplete,
    marketLeaderComplete,
    phases,
  });

  return {
    prerequisites,
    seriesAComplete,
    present,
    missing,
    phases,
    goDecision,
    marketLeaderComplete,
    readyForMoatSmokes,
    readyForAnalystKitSmokes,
    marketLeaderMilestone,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMarketLeaderPositioningEnv();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era21-market-leader-positioning-v1",
          prerequisitesComplete: result.prerequisites.prerequisitesComplete,
          seriesAComplete: result.seriesAComplete,
          goDecision: result.goDecision,
          marketLeaderComplete: result.marketLeaderComplete,
          readyForMoatSmokes: result.readyForMoatSmokes,
          readyForAnalystKitSmokes: result.readyForAnalystKitSmokes,
          marketLeaderMilestone: result.marketLeaderMilestone,
          presentCount: result.present.length,
          missing: result.missing,
          phases: result.phases.map((phase) => ({
            id: phase.id,
            label: phase.label,
            complete: phase.complete,
            optional: phase.optional,
            detail: phase.detail,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(result.prerequisites.prerequisitesComplete ? 0 : 2);
  }

  console.log(`\nMarket leader positioning validation (era21-market-leader-positioning-v1)\n`);

  if (!result.seriesAComplete) {
    console.log("Blocked — complete Series A / partner expansion (Step 7) first.\n");
    process.exit(2);
  }

  if (!result.prerequisites.prerequisitesComplete) {
    console.log("Blocked — decision must be GO in artifacts/pilot-gono-go-summary.json.\n");
    process.exit(2);
  }

  console.log(`Market leader milestone: ${result.marketLeaderMilestone}\n`);

  for (const phase of result.phases) {
    const marker = phase.complete ? "✓" : phase.optional ? "○ (optional)" : "○";
    console.log(`${marker} ${phase.label}`);
    console.log(`  ${phase.detail}\n`);
  }

  console.log(`Market leader complete: ${result.marketLeaderComplete ? "yes" : "no"}\n`);
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
