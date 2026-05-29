/**
 * Series A / partner expansion integrity — blocks Series A without honest Scale + matrix proof.
 * Policy: era31-series-a-partner-expansion-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  recomputeCompetitorMatrixProofStatusFromSummary,
  resolveCompetitorMatrixOverall,
} from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import {
  evaluateScaleReadinessIntegrity,
  type ScaleReadinessIntegrityBaseline,
} from "@/lib/commercial/scale-readiness-integrity-era30";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  detectSeriesAPartnerExpansionStarted,
  resolveScaleCompleteForSeriesA,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/scale-readiness-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { Month2MarketReadinessIntegrityBaseline } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import type { PilotWeek1ExecutionIntegrityBaseline } from "@/lib/commercial/pilot-week1-execution-integrity-era28";

export const SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_POLICY_ID =
  "era31-series-a-partner-expansion-integrity-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/series-a-partner-expansion-integrity-baseline.json" as const;

export type SeriesAPartnerExpansionIntegrityViolationId =
  | "scale_prerequisite_not_complete"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "series_a_started_without_scale"
  | "fake_competitor_matrix_pass"
  | "fake_competitor_matrix_proof_mismatch"
  | "baseline_regression";

export type SeriesAPartnerExpansionIntegrityViolation = {
  id: SeriesAPartnerExpansionIntegrityViolationId;
  detail: string;
};

export type SeriesAPartnerExpansionIntegrityBaseline = {
  seriesAExecutionHonest: true;
  recordedAt: string;
  scaleCompleteAttested: true;
  goDecision: "GO";
};

export type SeriesAPartnerExpansionIntegritySummary = {
  policyId: typeof SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_POLICY_ID;
  integrityPassed: boolean;
  seriesAExecutionStarted: boolean;
  scaleComplete: boolean;
  scaleIntegrityPassed: boolean;
  month2IntegrityPassed: boolean;
  week1IntegrityPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  competitorArtifactPresent: boolean;
  competitorOverall: string | null;
  recomputedMatrixProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly SeriesAPartnerExpansionIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly SeriesAPartnerExpansionIntegrityViolationId[] = [
  "scale_prerequisite_not_complete",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "series_a_started_without_scale",
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

function readIntegrityBaseline(root: string): SeriesAPartnerExpansionIntegrityBaseline | null {
  try {
    const path = join(root, SERIES_A_PARTNER_EXPANSION_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as SeriesAPartnerExpansionIntegrityBaseline;
  } catch {
    return null;
  }
}

export function evaluateSeriesAPartnerExpansionIntegrity(
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
    baselineOverride?: SeriesAPartnerExpansionIntegrityBaseline | null;
  },
): SeriesAPartnerExpansionIntegritySummary {
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
  const rollback = options?.rollbackDrillOverride ?? null;
  const competitor =
    options?.competitorMatrixOverride !== undefined
      ? options.competitorMatrixOverride
      : readJsonFile<CompetitorFeatureGapMatrixSummary>(
          root,
          COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
        );
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const scaleIntegrity = evaluateScaleReadinessIntegrity(root, {
    env,
    goNoGoOverride: goNoGo,
    p0StagingOverride: p0Staging,
    tier2SummaryOverride: tier2,
    metricsBaselineOverride: metrics,
    caseStudyDraftOverride: caseStudy,
    investorOnepagerOverride: investor,
    rollbackDrillOverride: rollback,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
    week1IntegrityBaselineOverride: options?.week1IntegrityBaselineOverride,
    month2IntegrityBaselineOverride: options?.month2IntegrityBaselineOverride,
    baselineOverride: options?.scaleIntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && scaleIntegrity.goIntegrityPassed;
  const scaleCompleteFromPhases = resolveScaleCompleteForSeriesA({
    goNoGoSummary: goNoGo,
    p0Staging,
    tier2Summary: tier2,
    metricsBaseline: metrics,
    caseStudyDraft: caseStudy,
    investorOnepager: investor,
    rollbackDrill: rollback,
    env,
  });
  const scaleHonest = scaleCompleteFromPhases && scaleIntegrity.integrityPassed;
  const seriesAExecutionStarted = detectSeriesAPartnerExpansionStarted(env, {
    competitorMatrix: competitor,
  });

  const violations: SeriesAPartnerExpansionIntegrityViolation[] = [];

  if (seriesAExecutionStarted && goDecision === "GO" && !scaleIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before Series A / partner train.",
    });
  }

  if (seriesAExecutionStarted && !scaleIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before Series A expansion.",
    });
  }

  if (seriesAExecutionStarted && !scaleIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before Series A tracks.",
    });
  }

  if (seriesAExecutionStarted && !scaleIntegrity.integrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before fundraise/partner motion.",
    });
  }

  if (seriesAExecutionStarted && !scaleHonest) {
    violations.push({
      id: "series_a_started_without_scale",
      detail: scaleCompleteFromPhases
        ? "Series A env/artifacts present but Scale integrity FAIL — fix Phase F before data room/partner tracks."
        : "Series A env/artifacts present but Scale is not complete — finish Scale gates 1–5 first.",
    });
  }

  if (seriesAExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "scale_prerequisite_not_complete",
      detail: `Series A started but GO decision=${goDecision ?? "missing"} — smoke:pilot-gono-go must remain honest GO.`,
    });
  }

  if (competitor) {
    const recomputed = recomputeCompetitorMatrixProofStatusFromSummary(competitor);
    const recomputedOverall = resolveCompetitorMatrixOverall(recomputed);
    if (competitor.overall === "PASSED" && recomputedOverall !== "PASSED") {
      violations.push({
        id: "fake_competitor_matrix_pass",
        detail: `Competitor matrix overall PASSED but recomputed ${recomputedOverall} — never hand-edit PASS without cert evidence.`,
      });
    }
    if (competitor.matrixProofStatus !== recomputed) {
      violations.push({
        id: "fake_competitor_matrix_proof_mismatch",
        detail: `matrixProofStatus=${competitor.matrixProofStatus} but recomputed ${recomputed} from certPassed=${competitor.certPassed} — partial ≠ PASS.`,
      });
    }
  }

  if (baseline?.seriesAExecutionHonest && (!goHonest || !scaleHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Series A at ${baseline.recordedAt} but GO/Scale is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_POLICY_ID,
    integrityPassed,
    seriesAExecutionStarted,
    scaleComplete: scaleHonest,
    scaleIntegrityPassed: scaleIntegrity.integrityPassed,
    month2IntegrityPassed: scaleIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: scaleIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: scaleIntegrity.goIntegrityPassed,
    competitorArtifactPresent: competitor !== null,
    competitorOverall: competitor?.overall ?? null,
    recomputedMatrixProofStatus: competitor
      ? recomputeCompetitorMatrixProofStatusFromSummary(competitor)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-series-a-partner-expansion-integrity -- --json",
      "npm run ops:validate-scale-readiness-integrity -- --json",
      "npm run ops:validate-series-a-partner-expansion-env -- --json",
      "npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write",
      "npm run smoke:competitor-feature-gap-matrix",
    ],
  };
}
