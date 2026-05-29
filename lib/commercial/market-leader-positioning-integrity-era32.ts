/**
 * Market leader positioning integrity — blocks market leader train without honest Series A.
 * Policy: era32-market-leader-positioning-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import { recomputeInvestorNarrativeProofStatusFromSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import {
  detectMarketLeaderPositioningStarted,
  resolveSeriesACompleteForMarketLeader,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import {
  recomputePilotRollbackProofStatusFromSummary,
} from "@/lib/commercial/pilot-rollback-drill-summary";
import {
  evaluateSeriesAPartnerExpansionIntegrity,
  type SeriesAPartnerExpansionIntegrityBaseline,
} from "@/lib/commercial/series-a-partner-expansion-integrity-era31";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { Month2MarketReadinessIntegrityBaseline } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import type { PilotWeek1ExecutionIntegrityBaseline } from "@/lib/commercial/pilot-week1-execution-integrity-era28";
import type { ScaleReadinessIntegrityBaseline } from "@/lib/commercial/scale-readiness-integrity-era30";

export const MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_POLICY_ID =
  "era32-market-leader-positioning-integrity-v1" as const;

export const MARKET_LEADER_POSITIONING_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/market-leader-positioning-integrity-baseline.json" as const;

export type MarketLeaderPositioningIntegrityViolationId =
  | "series_a_prerequisite_not_complete"
  | "series_a_integrity_fail"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "market_leader_started_without_series_a"
  | "fake_investor_pass"
  | "fake_investor_proof_mismatch"
  | "fake_rollback_pass"
  | "fake_rollback_proof_mismatch"
  | "baseline_regression";

export type MarketLeaderPositioningIntegrityViolation = {
  id: MarketLeaderPositioningIntegrityViolationId;
  detail: string;
};

export type MarketLeaderPositioningIntegrityBaseline = {
  marketLeaderExecutionHonest: true;
  recordedAt: string;
  seriesACompleteAttested: true;
  goDecision: "GO";
};

export type MarketLeaderPositioningIntegritySummary = {
  policyId: typeof MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_POLICY_ID;
  integrityPassed: boolean;
  marketLeaderExecutionStarted: boolean;
  seriesAComplete: boolean;
  seriesAIntegrityPassed: boolean;
  scaleIntegrityPassed: boolean;
  month2IntegrityPassed: boolean;
  week1IntegrityPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  investorArtifactPresent: boolean;
  investorOverall: string | null;
  recomputedNarrativeProofStatus: string | null;
  rollbackArtifactPresent: boolean;
  rollbackProofStatus: string | null;
  recomputedRollbackProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly MarketLeaderPositioningIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly MarketLeaderPositioningIntegrityViolationId[] = [
  "series_a_prerequisite_not_complete",
  "series_a_integrity_fail",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "market_leader_started_without_series_a",
  "fake_investor_pass",
  "fake_investor_proof_mismatch",
  "fake_rollback_pass",
  "fake_rollback_proof_mismatch",
  "baseline_regression",
];

function readJsonFile<T>(root: string, relativePath: string): T | null {
  const path = join(root, relativePath);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function readIntegrityBaseline(root: string): MarketLeaderPositioningIntegrityBaseline | null {
  try {
    const path = join(root, MARKET_LEADER_POSITIONING_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as MarketLeaderPositioningIntegrityBaseline;
  } catch {
    return null;
  }
}

export function evaluateMarketLeaderPositioningIntegrity(
  root: string = process.cwd(),
  options?: {
    env?: NodeJS.ProcessEnv;
    goNoGoOverride?: PilotGoNoGoSummary | null;
    p0StagingOverride?: P0StagingProofUnblockSummary | null;
    tier2SummaryOverride?: Tier2StagingGoldenPathSummary | null;
    metricsBaselineOverride?: PilotMetricsBaselineSummary | null;
    caseStudyDraftOverride?: PilotCaseStudyDraftSummary | null;
    investorOnepagerOverride?: InvestorNarrativeOnepagerSummary | null;
    rollbackDrillOverride?: PilotRollbackDrillSummary | null;
    competitorMatrixOverride?: CompetitorFeatureGapMatrixSummary | null;
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    week1IntegrityBaselineOverride?: PilotWeek1ExecutionIntegrityBaseline | null;
    month2IntegrityBaselineOverride?: Month2MarketReadinessIntegrityBaseline | null;
    scaleIntegrityBaselineOverride?: ScaleReadinessIntegrityBaseline | null;
    seriesAIntegrityBaselineOverride?: SeriesAPartnerExpansionIntegrityBaseline | null;
    baselineOverride?: MarketLeaderPositioningIntegrityBaseline | null;
  },
): MarketLeaderPositioningIntegritySummary {
  const env = options?.env ?? process.env;
  const goNoGo =
    options?.goNoGoOverride !== undefined
      ? options.goNoGoOverride
      : readJsonFile<PilotGoNoGoSummary>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  const p0Staging = options?.p0StagingOverride ?? null;
  const tier2 = options?.tier2SummaryOverride ?? null;
  const metrics =
    options?.metricsBaselineOverride !== undefined
      ? options.metricsBaselineOverride
      : readJsonFile<PilotMetricsBaselineSummary>(root, PILOT_METRICS_BASELINE_ARTIFACT_PATH);
  const caseStudy =
    options?.caseStudyDraftOverride !== undefined
      ? options.caseStudyDraftOverride
      : readJsonFile<PilotCaseStudyDraftSummary>(root, PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH);
  const investor =
    options?.investorOnepagerOverride !== undefined
      ? options.investorOnepagerOverride
      : readJsonFile<InvestorNarrativeOnepagerSummary>(root, INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH);
  const rollback =
    options?.rollbackDrillOverride !== undefined
      ? options.rollbackDrillOverride
      : readJsonFile<PilotRollbackDrillSummary>(root, PILOT_ROLLBACK_DRILL_ARTIFACT_PATH);
  const competitor = options?.competitorMatrixOverride ?? null;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const seriesAIntegrity = evaluateSeriesAPartnerExpansionIntegrity(root, {
    env,
    goNoGoOverride: goNoGo,
    p0StagingOverride: p0Staging,
    tier2SummaryOverride: tier2,
    metricsBaselineOverride: metrics,
    caseStudyDraftOverride: caseStudy,
    investorOnepagerOverride: investor,
    rollbackDrillOverride: rollback,
    competitorMatrixOverride: competitor,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
    week1IntegrityBaselineOverride: options?.week1IntegrityBaselineOverride,
    month2IntegrityBaselineOverride: options?.month2IntegrityBaselineOverride,
    scaleIntegrityBaselineOverride: options?.scaleIntegrityBaselineOverride,
    baselineOverride: options?.seriesAIntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && seriesAIntegrity.goIntegrityPassed;
  const seriesACompleteFromPhases = resolveSeriesACompleteForMarketLeader({
    goNoGoSummary: goNoGo,
    p0Staging,
    tier2Summary: tier2,
    metricsBaseline: metrics,
    caseStudyDraft: caseStudy,
    investorOnepager: investor,
    rollbackDrill: rollback,
    competitorMatrix: competitor,
    env,
  });
  const seriesAHonest = seriesACompleteFromPhases && seriesAIntegrity.integrityPassed;
  const marketLeaderExecutionStarted = detectMarketLeaderPositioningStarted(env);

  const violations: MarketLeaderPositioningIntegrityViolation[] = [];

  if (marketLeaderExecutionStarted && goDecision === "GO" && !seriesAIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before market leader positioning train.",
    });
  }

  if (marketLeaderExecutionStarted && !seriesAIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before category narrative.",
    });
  }

  if (marketLeaderExecutionStarted && !seriesAIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before analyst kit.",
    });
  }

  if (marketLeaderExecutionStarted && !seriesAIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before market leader pillars.",
    });
  }

  if (marketLeaderExecutionStarted && !seriesAIntegrity.integrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before market leader copy.",
    });
  }

  if (marketLeaderExecutionStarted && !seriesAHonest) {
    violations.push({
      id: "market_leader_started_without_series_a",
      detail: seriesACompleteFromPhases
        ? "MARKET_LEADER_* env present but Series A integrity FAIL — fix Phase G before category/moat pillars."
        : "MARKET_LEADER_* env present but Series A is not complete — finish Series A tracks A–D first.",
    });
  }

  if (marketLeaderExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "series_a_prerequisite_not_complete",
      detail: `Market leader started but GO decision=${goDecision ?? "missing"} — smoke:pilot-gono-go must remain honest GO.`,
    });
  }

  if (investor && marketLeaderExecutionStarted) {
    const recomputed = recomputeInvestorNarrativeProofStatusFromSummary(investor);
    if (investor.overall === "PASSED" && recomputed !== "proof_ready_with_metrics") {
      violations.push({
        id: "fake_investor_pass",
        detail: `Investor one-pager overall PASSED but recomputed ${recomputed} — never hand-edit PASS for analyst kit.`,
      });
    }
    if (
      investor.overall === "PASSED" &&
      investor.narrativeProofStatus !== "proof_ready_with_metrics"
    ) {
      violations.push({
        id: "fake_investor_proof_mismatch",
        detail: `overall PASSED but narrativeProofStatus=${investor.narrativeProofStatus} — SKIPPED ≠ proof_ready_with_metrics.`,
      });
    }
  }

  if (rollback && marketLeaderExecutionStarted) {
    const recomputed = recomputePilotRollbackProofStatusFromSummary(rollback);
    if (rollback.rollbackProofStatus === "proof_passed" && recomputed !== "proof_passed") {
      violations.push({
        id: "fake_rollback_pass",
        detail: `Rollback proof_passed but recomputed ${recomputed} — never hand-edit moat deck drill PASS.`,
      });
    }
    if (
      rollback.rollbackProofStatus === "proof_passed" &&
      rollback.passedStepCount < rollback.totalSteps
    ) {
      violations.push({
        id: "fake_rollback_proof_mismatch",
        detail: `rollbackProofStatus=proof_passed but passed ${rollback.passedStepCount}/${rollback.totalSteps} steps — partial ≠ PASS.`,
      });
    }
  }

  if (baseline?.marketLeaderExecutionHonest && (!goHonest || !seriesAHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest market leader at ${baseline.recordedAt} but GO/Series A is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_POLICY_ID,
    integrityPassed,
    marketLeaderExecutionStarted,
    seriesAComplete: seriesAHonest,
    seriesAIntegrityPassed: seriesAIntegrity.integrityPassed,
    scaleIntegrityPassed: seriesAIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: seriesAIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: seriesAIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: seriesAIntegrity.goIntegrityPassed,
    investorArtifactPresent: investor !== null,
    investorOverall: investor?.overall ?? null,
    recomputedNarrativeProofStatus: investor
      ? recomputeInvestorNarrativeProofStatusFromSummary(investor)
      : null,
    rollbackArtifactPresent: rollback !== null,
    rollbackProofStatus: rollback?.rollbackProofStatus ?? null,
    recomputedRollbackProofStatus: rollback
      ? recomputePilotRollbackProofStatusFromSummary(rollback)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-market-leader-positioning-integrity -- --json",
      "npm run ops:validate-series-a-partner-expansion-integrity -- --json",
      "npm run ops:validate-market-leader-positioning-env -- --json",
      "npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write",
      "npm run smoke:investor-narrative-onepager",
      "npm run smoke:pilot-rollback-drill",
    ],
  };
}
