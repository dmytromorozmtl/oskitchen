#!/usr/bin/env npx tsx
/**
 * Validates Sustained operational excellence env + cadences (Step 9).
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
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  buildSustainedOperationalExcellencePhaseStatuses,
  resolveMarketLeaderCompleteForSustainedOps,
  resolveSustainedOperationalExcellenceComplete,
  resolveSustainedOperationalExcellencePrerequisites,
  SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { resolveSustainedOperationalExcellenceMilestone } from "@/lib/commercial/sustained-operational-excellence-post-market-leader-orchestrator-era21";

function readJson<T>(path: string): T | null {
  const full = join(process.cwd(), path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readSustainedOperationalExcellenceArtifacts(): {
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

export function evaluateSustainedOperationalExcellenceEnv(
  env: NodeJS.ProcessEnv = process.env,
): {
  prerequisites: ReturnType<typeof resolveSustainedOperationalExcellencePrerequisites>;
  marketLeaderComplete: boolean;
  present: string[];
  missing: string[];
  phases: ReturnType<typeof buildSustainedOperationalExcellencePhaseStatuses>;
  goDecision: string | null;
  sustainedOpsComplete: boolean;
  readyForIntegrationSmokes: boolean;
  readyForMetricsSmokes: boolean;
  sustainedOpsMilestone: ReturnType<typeof resolveSustainedOperationalExcellenceMilestone>;
} {
  const artifacts = readSustainedOperationalExcellenceArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const marketLeaderComplete = resolveMarketLeaderCompleteForSustainedOps({
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
  const prerequisites = resolveSustainedOperationalExcellencePrerequisites({
    goDecision,
    marketLeaderComplete,
  });
  const present = SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS.filter((key) =>
    Boolean(env[key]?.trim()),
  );
  const missing = SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS.filter(
    (key) => !env[key]?.trim(),
  );
  const phases = buildSustainedOperationalExcellencePhaseStatuses({
    prerequisites,
    goNoGoSummary: artifacts.goNoGoSummary,
    p0Staging: artifacts.p0Staging,
    tier2Summary: artifacts.tier2Summary,
    metricsBaseline: artifacts.metricsBaseline,
    competitorMatrix: artifacts.competitorMatrix,
    env,
  });
  const sustainedOpsComplete = resolveSustainedOperationalExcellenceComplete(phases);
  const cadenceB = phases.find((phase) => phase.id === "cadence_b_weekly_integration");
  const cadenceC = phases.find((phase) => phase.id === "cadence_c_monthly_metrics");
  const channelLivePassed = artifacts.p0Staging?.children.channelLive.overall === "PASSED";
  const tier2Passed = artifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const integrationHonest = channelLivePassed || tier2Passed;
  const weeklyReviewAttested = Boolean(env.SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED?.trim());
  const metricsPassed = artifacts.metricsBaseline?.overall === "PASSED";
  const monthlyRefreshAttested = Boolean(env.SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED?.trim());
  const readyForIntegrationSmokes =
    prerequisites.prerequisitesComplete &&
    !sustainedOpsComplete &&
    cadenceB?.complete !== true &&
    integrationHonest &&
    !weeklyReviewAttested;
  const readyForMetricsSmokes =
    prerequisites.prerequisitesComplete &&
    !sustainedOpsComplete &&
    cadenceC?.complete !== true &&
    metricsPassed &&
    !monthlyRefreshAttested;
  const sustainedOpsMilestone = resolveSustainedOperationalExcellenceMilestone({
    prerequisitesComplete: prerequisites.prerequisitesComplete,
    marketLeaderComplete,
    sustainedOpsComplete,
    phases,
  });

  return {
    prerequisites,
    marketLeaderComplete,
    present,
    missing,
    phases,
    goDecision,
    sustainedOpsComplete,
    readyForIntegrationSmokes,
    readyForMetricsSmokes,
    sustainedOpsMilestone,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedOperationalExcellenceEnv();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era21-sustained-operational-excellence-v1",
          prerequisitesComplete: result.prerequisites.prerequisitesComplete,
          marketLeaderComplete: result.marketLeaderComplete,
          goDecision: result.goDecision,
          sustainedOpsComplete: result.sustainedOpsComplete,
          readyForIntegrationSmokes: result.readyForIntegrationSmokes,
          readyForMetricsSmokes: result.readyForMetricsSmokes,
          sustainedOpsMilestone: result.sustainedOpsMilestone,
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

  console.log(
    `\nSustained operational excellence validation (era21-sustained-operational-excellence-v1)\n`,
  );

  if (!result.marketLeaderComplete) {
    console.log("Blocked — complete Market leader positioning (Step 8) first.\n");
    process.exit(2);
  }

  if (!result.prerequisites.prerequisitesComplete) {
    console.log("Blocked — decision must be GO in artifacts/pilot-gono-go-summary.json.\n");
    process.exit(2);
  }

  console.log(`Sustained ops milestone: ${result.sustainedOpsMilestone}\n`);

  for (const phase of result.phases) {
    const marker = phase.complete ? "✓" : phase.optional ? "○ (optional)" : "○";
    console.log(`${marker} ${phase.label}`);
    console.log(`  ${phase.detail}\n`);
  }

  console.log(`Sustained ops complete: ${result.sustainedOpsComplete ? "yes" : "no"}\n`);
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
