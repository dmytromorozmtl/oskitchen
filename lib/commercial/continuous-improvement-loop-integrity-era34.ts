/**
 * Continuous improvement loop integrity — blocks pure operational mode without honest Sustained ops.
 * Policy: era34-continuous-improvement-loop-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  recomputeCompetitorMatrixProofStatusFromSummary,
  resolveCompetitorMatrixOverall,
} from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  detectContinuousImprovementLoopStarted,
  resolveSustainedOpsCompleteForContinuousImprovement,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  recomputePilotBaselineProofStatusFromSummary,
  resolvePilotMetricsBaselineOverall,
} from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import {
  evaluateSustainedOperationalExcellenceIntegrity,
  type SustainedOperationalExcellenceIntegrityBaseline,
} from "@/lib/commercial/sustained-operational-excellence-integrity-era33";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { Month2MarketReadinessIntegrityBaseline } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import type { PilotWeek1ExecutionIntegrityBaseline } from "@/lib/commercial/pilot-week1-execution-integrity-era28";
import type { ScaleReadinessIntegrityBaseline } from "@/lib/commercial/scale-readiness-integrity-era30";
import type { SeriesAPartnerExpansionIntegrityBaseline } from "@/lib/commercial/series-a-partner-expansion-integrity-era31";
import type { MarketLeaderPositioningIntegrityBaseline } from "@/lib/commercial/market-leader-positioning-integrity-era32";

export const CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID =
  "era34-continuous-improvement-loop-integrity-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/continuous-improvement-loop-integrity-baseline.json" as const;

export type ContinuousImprovementLoopIntegrityViolationId =
  | "sustained_ops_prerequisite_not_complete"
  | "sustained_ops_integrity_fail"
  | "market_leader_integrity_fail"
  | "series_a_integrity_fail"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "improvement_loop_started_without_sustained_ops"
  | "fake_release_cadence_attestation"
  | "fake_metrics_pass"
  | "fake_metrics_proof_mismatch"
  | "fake_competitor_matrix_pass"
  | "fake_competitor_matrix_proof_mismatch"
  | "baseline_regression";

export type ContinuousImprovementLoopIntegrityViolation = {
  id: ContinuousImprovementLoopIntegrityViolationId;
  detail: string;
};

export type ContinuousImprovementLoopIntegrityBaseline = {
  improvementLoopExecutionHonest: true;
  recordedAt: string;
  sustainedOpsCompleteAttested: true;
  goDecision: "GO";
};

export type ContinuousImprovementLoopIntegritySummary = {
  policyId: typeof CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID;
  integrityPassed: boolean;
  improvementLoopExecutionStarted: boolean;
  sustainedOpsComplete: boolean;
  sustainedOpsIntegrityPassed: boolean;
  marketLeaderIntegrityPassed: boolean;
  seriesAIntegrityPassed: boolean;
  scaleIntegrityPassed: boolean;
  month2IntegrityPassed: boolean;
  week1IntegrityPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  metricsArtifactPresent: boolean;
  metricsOverall: string | null;
  recomputedBaselineProofStatus: string | null;
  competitorArtifactPresent: boolean;
  competitorOverall: string | null;
  recomputedMatrixProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly ContinuousImprovementLoopIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly ContinuousImprovementLoopIntegrityViolationId[] = [
  "sustained_ops_prerequisite_not_complete",
  "sustained_ops_integrity_fail",
  "market_leader_integrity_fail",
  "series_a_integrity_fail",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "improvement_loop_started_without_sustained_ops",
  "fake_release_cadence_attestation",
  "fake_metrics_pass",
  "fake_metrics_proof_mismatch",
  "fake_competitor_matrix_pass",
  "fake_competitor_matrix_proof_mismatch",
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

function readIntegrityBaseline(root: string): ContinuousImprovementLoopIntegrityBaseline | null {
  try {
    const path = join(root, CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as ContinuousImprovementLoopIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateContinuousImprovementLoopIntegrity(
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
    marketLeaderIntegrityBaselineOverride?: MarketLeaderPositioningIntegrityBaseline | null;
    sustainedOpsIntegrityBaselineOverride?: SustainedOperationalExcellenceIntegrityBaseline | null;
    baselineOverride?: ContinuousImprovementLoopIntegrityBaseline | null;
  },
): ContinuousImprovementLoopIntegritySummary {
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
  const caseStudy = options?.caseStudyDraftOverride ?? null;
  const investor = options?.investorOnepagerOverride ?? null;
  const rollback = options?.rollbackDrillOverride ?? null;
  const competitor = options?.competitorMatrixOverride ?? null;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const sustainedOpsIntegrity = evaluateSustainedOperationalExcellenceIntegrity(root, {
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
    seriesAIntegrityBaselineOverride: options?.seriesAIntegrityBaselineOverride,
    marketLeaderIntegrityBaselineOverride: options?.marketLeaderIntegrityBaselineOverride,
    baselineOverride: options?.sustainedOpsIntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && sustainedOpsIntegrity.goIntegrityPassed;
  const sustainedOpsCompleteFromPhases = resolveSustainedOpsCompleteForContinuousImprovement({
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
  const sustainedOpsHonest =
    sustainedOpsCompleteFromPhases && sustainedOpsIntegrity.integrityPassed;
  const improvementLoopExecutionStarted = detectContinuousImprovementLoopStarted(env);
  const releaseCadenceAttested = parseEnvBoolean(env.CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CADENCE_REVIEWED);

  const violations: ContinuousImprovementLoopIntegrityViolation[] = [];

  if (improvementLoopExecutionStarted && goDecision === "GO" && !sustainedOpsIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before pure operational improvement loop.",
    });
  }

  if (improvementLoopExecutionStarted && !sustainedOpsIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before improvement loop.",
    });
  }

  if (improvementLoopExecutionStarted && !sustainedOpsIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before improvement loop.",
    });
  }

  if (improvementLoopExecutionStarted && !sustainedOpsIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before pure operational mode.",
    });
  }

  if (improvementLoopExecutionStarted && !sustainedOpsIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before improvement loop.",
    });
  }

  if (improvementLoopExecutionStarted && !sustainedOpsIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before improvement loop.",
    });
  }

  if (improvementLoopExecutionStarted && !sustainedOpsIntegrity.integrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before pure operational mode.",
    });
  }

  if (improvementLoopExecutionStarted && !sustainedOpsHonest) {
    violations.push({
      id: "improvement_loop_started_without_sustained_ops",
      detail: sustainedOpsCompleteFromPhases
        ? "CONTINUOUS_IMPROVEMENT_* env present but Sustained ops integrity FAIL — fix Phase I before recurring tracks."
        : "CONTINUOUS_IMPROVEMENT_* env present but Sustained ops cadences A–D are not complete — finish Step 9 first.",
    });
  }

  if (improvementLoopExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "sustained_ops_prerequisite_not_complete",
      detail: `Improvement loop started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    releaseCadenceAttested &&
    improvementLoopExecutionStarted &&
    (!sustainedOpsHonest || !sustainedOpsIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_release_cadence_attestation",
      detail:
        "CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CADENCE_REVIEWED=1 before honest Sustained ops — never attest per-release cadence without test:ci:commercial-pilot-runbook:cert on honest chain.",
    });
  }

  if (metrics && improvementLoopExecutionStarted) {
    const recomputed = recomputePilotBaselineProofStatusFromSummary(metrics);
    const recomputedOverall = resolvePilotMetricsBaselineOverall(recomputed);
    if (metrics.overall === "PASSED" && recomputedOverall !== "PASSED") {
      violations.push({
        id: "fake_metrics_pass",
        detail: `Metrics baseline overall PASSED but recomputed ${recomputedOverall} — never hand-edit PASS for monthly improvement track.`,
      });
    }
    if (metrics.baselineProofStatus !== recomputed) {
      violations.push({
        id: "fake_metrics_proof_mismatch",
        detail: `overall=${metrics.overall} but baselineProofStatus=${metrics.baselineProofStatus} — recomputed ${recomputed}.`,
      });
    }
  }

  if (competitor && improvementLoopExecutionStarted) {
    const recomputed = recomputeCompetitorMatrixProofStatusFromSummary(competitor);
    const recomputedOverall = resolveCompetitorMatrixOverall(recomputed);
    if (competitor.overall === "PASSED" && recomputedOverall !== "PASSED") {
      violations.push({
        id: "fake_competitor_matrix_pass",
        detail: `Competitor matrix overall PASSED but recomputed ${recomputedOverall} — never hand-edit PASS for quarterly governance track.`,
      });
    }
    if (competitor.matrixProofStatus !== recomputed) {
      violations.push({
        id: "fake_competitor_matrix_proof_mismatch",
        detail: `matrixProofStatus=${competitor.matrixProofStatus} — recomputed ${recomputed} for ${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}.`,
      });
    }
  }

  if (baseline?.improvementLoopExecutionHonest && (!goHonest || !sustainedOpsHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest improvement loop at ${baseline.recordedAt} but GO/Sustained ops is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID,
    integrityPassed,
    improvementLoopExecutionStarted,
    sustainedOpsComplete: sustainedOpsHonest,
    sustainedOpsIntegrityPassed: sustainedOpsIntegrity.integrityPassed,
    marketLeaderIntegrityPassed: sustainedOpsIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: sustainedOpsIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: sustainedOpsIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: sustainedOpsIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: sustainedOpsIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: sustainedOpsIntegrity.goIntegrityPassed,
    metricsArtifactPresent: metrics !== null,
    metricsOverall: metrics?.overall ?? null,
    recomputedBaselineProofStatus: metrics
      ? recomputePilotBaselineProofStatusFromSummary(metrics)
      : null,
    competitorArtifactPresent: competitor !== null,
    competitorOverall: competitor?.overall ?? null,
    recomputedMatrixProofStatus: competitor
      ? recomputeCompetitorMatrixProofStatusFromSummary(competitor)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run ops:validate-sustained-operational-excellence-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop -- --json",
      "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
      "npm run smoke:pilot-metrics-baseline",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
