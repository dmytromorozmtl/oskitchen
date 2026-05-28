#!/usr/bin/env npx tsx
/**
 * Validates Series A / partner expansion env + artifact tracks (Step 7).
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
import { resolveSeriesAPartnerExpansionMilestone } from "@/lib/commercial/series-a-partner-expansion-post-scale-orchestrator-era21";
import {
  buildSeriesAPartnerExpansionPhaseStatuses,
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveScaleCompleteForSeriesA,
  resolveSeriesAPartnerExpansionComplete,
  resolveSeriesAPartnerExpansionPrerequisites,
  SERIES_A_PARTNER_EXPANSION_TRACKED_ENV_KEYS,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";

function readJson<T>(path: string): T | null {
  const full = join(process.cwd(), path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readSeriesAPartnerExpansionArtifacts(): {
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
    rollbackDrill: readJson<PilotRollbackDrillSummary>(
      "artifacts/pilot-rollback-drill-summary.json",
    ),
    competitorMatrix: readJson<CompetitorFeatureGapMatrixSummary>(
      COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
    ),
  };
}

export function evaluateSeriesAPartnerExpansionEnv(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveSeriesAPartnerExpansionPrerequisites>;
  scaleComplete: boolean;
  present: string[];
  missing: string[];
  phases: ReturnType<typeof buildSeriesAPartnerExpansionPhaseStatuses>;
  goDecision: string | null;
  seriesAComplete: boolean;
  readyForDataRoomSmokes: boolean;
  readyForPartnerSmokes: boolean;
  seriesAMilestone: ReturnType<typeof resolveSeriesAPartnerExpansionMilestone>;
} {
  const artifacts = readSeriesAPartnerExpansionArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const scaleComplete = resolveScaleCompleteForSeriesA({
    goNoGoSummary: artifacts.goNoGoSummary,
    p0Staging: artifacts.p0Staging,
    tier2Summary: artifacts.tier2Summary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    investorOnepager: artifacts.investorOnepager,
    rollbackDrill: artifacts.rollbackDrill,
    env,
  });
  const prerequisites = resolveSeriesAPartnerExpansionPrerequisites({
    goDecision,
    scaleComplete,
  });
  const present = SERIES_A_PARTNER_EXPANSION_TRACKED_ENV_KEYS.filter((key) =>
    Boolean(env[key]?.trim()),
  );
  const missing = SERIES_A_PARTNER_EXPANSION_TRACKED_ENV_KEYS.filter((key) => !env[key]?.trim());
  const phases = buildSeriesAPartnerExpansionPhaseStatuses({
    prerequisites,
    goNoGoSummary: artifacts.goNoGoSummary,
    p0Staging: artifacts.p0Staging,
    tier2Summary: artifacts.tier2Summary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    investorOnepager: artifacts.investorOnepager,
    competitorMatrix: artifacts.competitorMatrix,
    env,
  });
  const seriesAComplete = resolveSeriesAPartnerExpansionComplete(phases);
  const trackA = phases.find((phase) => phase.id === "track_a_series_a_data_room");
  const trackB = phases.find((phase) => phase.id === "track_b_partner_channel_expansion");
  const competitorAligned =
    artifacts.competitorMatrix?.overall === "PASSED" &&
    artifacts.competitorMatrix.matrixProofStatus === "evidence_aligned_era17";
  const channelLivePassed = artifacts.p0Staging?.children.channelLive.overall === "PASSED";
  const tier2Passed = artifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const integrationHonest = channelLivePassed || tier2Passed;
  const readyForDataRoomSmokes =
    prerequisites.prerequisitesComplete &&
    !seriesAComplete &&
    trackA?.complete !== true &&
    !competitorAligned;
  const readyForPartnerSmokes =
    prerequisites.prerequisitesComplete &&
    !seriesAComplete &&
    trackB?.complete !== true &&
    !integrationHonest;
  const seriesAMilestone = resolveSeriesAPartnerExpansionMilestone({
    prerequisitesComplete: prerequisites.prerequisitesComplete,
    scaleComplete,
    seriesAComplete,
    phases,
  });

  return {
    prerequisites,
    scaleComplete,
    present,
    missing,
    phases,
    goDecision,
    seriesAComplete,
    readyForDataRoomSmokes,
    readyForPartnerSmokes,
    seriesAMilestone,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSeriesAPartnerExpansionEnv();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era21-series-a-partner-expansion-v1",
          prerequisitesComplete: result.prerequisites.prerequisitesComplete,
          scaleComplete: result.scaleComplete,
          goDecision: result.goDecision,
          seriesAComplete: result.seriesAComplete,
          readyForDataRoomSmokes: result.readyForDataRoomSmokes,
          readyForPartnerSmokes: result.readyForPartnerSmokes,
          seriesAMilestone: result.seriesAMilestone,
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

  console.log(`\nSeries A / partner expansion validation (era21-series-a-partner-expansion-v1)\n`);

  if (!result.scaleComplete) {
    console.log("Blocked — complete Scale readiness (Step 6) first.\n");
    process.exit(2);
  }

  if (!result.prerequisites.prerequisitesComplete) {
    console.log("Blocked — decision must be GO in artifacts/pilot-gono-go-summary.json.\n");
    process.exit(2);
  }

  console.log(`Series A milestone: ${result.seriesAMilestone}\n`);

  for (const phase of result.phases) {
    const marker = phase.complete ? "✓" : phase.optional ? "○ (optional)" : "○";
    console.log(`${marker} ${phase.label}`);
    console.log(`  ${phase.detail}\n`);
  }

  console.log(`Series A complete: ${result.seriesAComplete ? "yes" : "no"}\n`);
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
