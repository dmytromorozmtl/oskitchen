/**
 * Sustained operational excellence integrity — blocks cadence train without honest Market leader.
 * Policy: era33-sustained-operational-excellence-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  recomputeCompetitorMatrixProofStatusFromSummary,
  resolveCompetitorMatrixOverall,
} from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import {
  evaluateMarketLeaderPositioningIntegrity,
  type MarketLeaderPositioningIntegrityBaseline,
} from "@/lib/commercial/market-leader-positioning-integrity-era32";
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
  detectSustainedOperationalExcellenceStarted,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  resolveMarketLeaderCompleteForSustainedOps,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { Month2MarketReadinessIntegrityBaseline } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import type { PilotWeek1ExecutionIntegrityBaseline } from "@/lib/commercial/pilot-week1-execution-integrity-era28";
import type { ScaleReadinessIntegrityBaseline } from "@/lib/commercial/scale-readiness-integrity-era30";
import type { SeriesAPartnerExpansionIntegrityBaseline } from "@/lib/commercial/series-a-partner-expansion-integrity-era31";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_POLICY_ID =
  "era33-sustained-operational-excellence-integrity-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/sustained-operational-excellence-integrity-baseline.json" as const;

export type SustainedOperationalExcellenceIntegrityViolationId =
  | "market_leader_prerequisite_not_complete"
  | "market_leader_integrity_fail"
  | "series_a_integrity_fail"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "sustained_ops_started_without_market_leader"
  | "fake_metrics_pass"
  | "fake_metrics_proof_mismatch"
  | "fake_competitor_matrix_pass"
  | "fake_competitor_matrix_proof_mismatch"
  | "baseline_regression";

export type SustainedOperationalExcellenceIntegrityViolation = {
  id: SustainedOperationalExcellenceIntegrityViolationId;
  detail: string;
};

export type SustainedOperationalExcellenceIntegrityBaseline = {
  sustainedOpsExecutionHonest: true;
  recordedAt: string;
  marketLeaderCompleteAttested: true;
  goDecision: "GO";
};

export type SustainedOperationalExcellenceIntegritySummary = {
  policyId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_POLICY_ID;
  integrityPassed: boolean;
  sustainedOpsExecutionStarted: boolean;
  marketLeaderComplete: boolean;
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
  violations: readonly SustainedOperationalExcellenceIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly SustainedOperationalExcellenceIntegrityViolationId[] = [
  "market_leader_prerequisite_not_complete",
  "market_leader_integrity_fail",
  "series_a_integrity_fail",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "sustained_ops_started_without_market_leader",
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

function readIntegrityBaseline(
  root: string,
): SustainedOperationalExcellenceIntegrityBaseline | null {
  try {
    const path = join(root, SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as SustainedOperationalExcellenceIntegrityBaseline;
  } catch {
    return null;
  }
}

export function evaluateSustainedOperationalExcellenceIntegrity(
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
    baselineOverride?: SustainedOperationalExcellenceIntegrityBaseline | null;
  },
): SustainedOperationalExcellenceIntegritySummary {
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

  const marketLeaderIntegrity = evaluateMarketLeaderPositioningIntegrity(root, {
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
    baselineOverride: options?.marketLeaderIntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && marketLeaderIntegrity.goIntegrityPassed;
  const marketLeaderCompleteFromPhases = resolveMarketLeaderCompleteForSustainedOps({
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
  const marketLeaderHonest =
    marketLeaderCompleteFromPhases && marketLeaderIntegrity.integrityPassed;
  const sustainedOpsExecutionStarted = detectSustainedOperationalExcellenceStarted(env);

  const violations: SustainedOperationalExcellenceIntegrityViolation[] = [];

  if (sustainedOpsExecutionStarted && goDecision === "GO" && !marketLeaderIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before sustained ops cadence train.",
    });
  }

  if (sustainedOpsExecutionStarted && !marketLeaderIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before recurring ops cadences.",
    });
  }

  if (sustainedOpsExecutionStarted && !marketLeaderIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before sustained ops.",
    });
  }

  if (sustainedOpsExecutionStarted && !marketLeaderIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before sustained ops cadences.",
    });
  }

  if (sustainedOpsExecutionStarted && !marketLeaderIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before sustained ops.",
    });
  }

  if (sustainedOpsExecutionStarted && !marketLeaderIntegrity.integrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before SUSTAINED_OPS_* cadences.",
    });
  }

  if (sustainedOpsExecutionStarted && !marketLeaderHonest) {
    violations.push({
      id: "sustained_ops_started_without_market_leader",
      detail: marketLeaderCompleteFromPhases
        ? "SUSTAINED_OPS_* env present but Market leader integrity FAIL — fix Phase H before daily/weekly/monthly cadences."
        : "SUSTAINED_OPS_* env present but Market leader pillars are not complete — finish Market leader 1–4 first.",
    });
  }

  if (sustainedOpsExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "market_leader_prerequisite_not_complete",
      detail: `Sustained ops started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (metrics && sustainedOpsExecutionStarted) {
    const recomputed = recomputePilotBaselineProofStatusFromSummary(metrics);
    const recomputedOverall = resolvePilotMetricsBaselineOverall(recomputed);
    if (metrics.overall === "PASSED" && recomputedOverall !== "PASSED") {
      violations.push({
        id: "fake_metrics_pass",
        detail: `Metrics baseline overall PASSED but recomputed ${recomputedOverall} — never hand-edit PASS for monthly cadence refresh.`,
      });
    }
    if (metrics.baselineProofStatus !== recomputed) {
      violations.push({
        id: "fake_metrics_proof_mismatch",
        detail: `overall=${metrics.overall} but baselineProofStatus=${metrics.baselineProofStatus} — recomputed ${recomputed}.`,
      });
    }
  }

  if (competitor && sustainedOpsExecutionStarted) {
    const recomputed = recomputeCompetitorMatrixProofStatusFromSummary(competitor);
    const recomputedOverall = resolveCompetitorMatrixOverall(recomputed);
    if (competitor.overall === "PASSED" && recomputedOverall !== "PASSED") {
      violations.push({
        id: "fake_competitor_matrix_pass",
        detail: `Competitor matrix overall PASSED but recomputed ${recomputedOverall} — never hand-edit PASS for quarterly governance.`,
      });
    }
    if (competitor.matrixProofStatus !== recomputed) {
      violations.push({
        id: "fake_competitor_matrix_proof_mismatch",
        detail: `matrixProofStatus=${competitor.matrixProofStatus} — recomputed ${recomputed} for ${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}.`,
      });
    }
  }

  if (baseline?.sustainedOpsExecutionHonest && (!goHonest || !marketLeaderHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest sustained ops at ${baseline.recordedAt} but GO/Market leader is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_POLICY_ID,
    integrityPassed,
    sustainedOpsExecutionStarted,
    marketLeaderComplete: marketLeaderHonest,
    marketLeaderIntegrityPassed: marketLeaderIntegrity.integrityPassed,
    seriesAIntegrityPassed: marketLeaderIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: marketLeaderIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: marketLeaderIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: marketLeaderIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: marketLeaderIntegrity.goIntegrityPassed,
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
      "npm run ops:validate-sustained-operational-excellence-integrity -- --json",
      "npm run ops:validate-market-leader-positioning-integrity -- --json",
      "npm run ops:validate-sustained-operational-excellence-env -- --json",
      "npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write",
      "npm run smoke:pilot-metrics-baseline",
      "npm run smoke:competitor-feature-gap-matrix",
    ],
  };
}
