/**
 * Sustained product evolution integrity — blocks product-led growth without honest Improvement loop.
 * Policy: era35-sustained-product-evolution-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  recomputeCompetitorMatrixProofStatusFromSummary,
  resolveCompetitorMatrixOverall,
} from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  evaluateContinuousImprovementLoopIntegrity,
  type ContinuousImprovementLoopIntegrityBaseline,
} from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  detectSustainedProductEvolutionStarted,
  resolveContinuousImprovementLoopActive,
  resolveEra25PureOperationalModeContext,
  resolveSustainedProductEvolutionPrerequisites,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID =
  "era35-sustained-product-evolution-integrity-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/sustained-product-evolution-integrity-baseline.json" as const;

export type SustainedProductEvolutionIntegrityViolationId =
  | "improvement_loop_prerequisite_not_complete"
  | "improvement_loop_integrity_fail"
  | "sustained_ops_integrity_fail"
  | "market_leader_integrity_fail"
  | "series_a_integrity_fail"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "product_evolution_started_without_improvement_loop"
  | "fake_ownership_matrix_attestation"
  | "fake_competitor_matrix_pass"
  | "fake_competitor_matrix_proof_mismatch"
  | "baseline_regression";

export type SustainedProductEvolutionIntegrityViolation = {
  id: SustainedProductEvolutionIntegrityViolationId;
  detail: string;
};

export type SustainedProductEvolutionIntegrityBaseline = {
  productEvolutionExecutionHonest: true;
  recordedAt: string;
  improvementLoopCompleteAttested: true;
  goDecision: "GO";
};

export type SustainedProductEvolutionIntegritySummary = {
  policyId: typeof SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID;
  integrityPassed: boolean;
  productEvolutionExecutionStarted: boolean;
  productEvolutionComplete: boolean;
  improvementLoopActive: boolean;
  improvementLoopIntegrityPassed: boolean;
  sustainedOpsIntegrityPassed: boolean;
  marketLeaderIntegrityPassed: boolean;
  seriesAIntegrityPassed: boolean;
  scaleIntegrityPassed: boolean;
  month2IntegrityPassed: boolean;
  week1IntegrityPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  sustainedOpsConvergenceReady: boolean;
  competitorArtifactPresent: boolean;
  competitorOverall: string | null;
  recomputedMatrixProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly SustainedProductEvolutionIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly SustainedProductEvolutionIntegrityViolationId[] = [
  "improvement_loop_prerequisite_not_complete",
  "improvement_loop_integrity_fail",
  "sustained_ops_integrity_fail",
  "market_leader_integrity_fail",
  "series_a_integrity_fail",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "product_evolution_started_without_improvement_loop",
  "fake_ownership_matrix_attestation",
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

function readIntegrityBaseline(root: string): SustainedProductEvolutionIntegrityBaseline | null {
  try {
    const path = join(root, SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as SustainedProductEvolutionIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateSustainedProductEvolutionIntegrity(
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
    improvementLoopIntegrityBaselineOverride?: ContinuousImprovementLoopIntegrityBaseline | null;
    baselineOverride?: SustainedProductEvolutionIntegrityBaseline | null;
  },
): SustainedProductEvolutionIntegritySummary {
  const env = options?.env ?? process.env;
  const goNoGo =
    options?.goNoGoOverride !== undefined
      ? options.goNoGoOverride
      : readJsonFile<PilotGoNoGoSummary>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  const p0Staging = options?.p0StagingOverride ?? null;
  const tier2 = options?.tier2SummaryOverride ?? null;
  const metrics = options?.metricsBaselineOverride ?? null;
  const caseStudy = options?.caseStudyDraftOverride ?? null;
  const investor = options?.investorOnepagerOverride ?? null;
  const rollback = options?.rollbackDrillOverride ?? null;
  const competitor = options?.competitorMatrixOverride ?? null;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const improvementLoopIntegrity = evaluateContinuousImprovementLoopIntegrity(root, {
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
    baselineOverride: options?.improvementLoopIntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && improvementLoopIntegrity.goIntegrityPassed;
  const era25 = resolveEra25PureOperationalModeContext(env);
  const improvementLoopActive = resolveContinuousImprovementLoopActive({
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
  const prerequisites = resolveSustainedProductEvolutionPrerequisites({
    goDecision,
    continuousImprovementLoopActive: improvementLoopActive,
    era25,
  });
  const productEvolutionCompleteFromPhases = prerequisites.productEvolutionReady;
  const productEvolutionHonest =
    productEvolutionCompleteFromPhases && improvementLoopIntegrity.integrityPassed;
  const productEvolutionExecutionStarted = detectSustainedProductEvolutionStarted(env);
  const ownershipMatrixReviewed = parseEnvBoolean(
    env.SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_REVIEWED,
  );

  const violations: SustainedProductEvolutionIntegrityViolation[] = [];

  if (productEvolutionExecutionStarted && goDecision === "GO" && !improvementLoopIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before product-led growth train.",
    });
  }

  if (productEvolutionExecutionStarted && !improvementLoopIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before product evolution.",
    });
  }

  if (productEvolutionExecutionStarted && !improvementLoopIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before product evolution.",
    });
  }

  if (productEvolutionExecutionStarted && !improvementLoopIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before product evolution.",
    });
  }

  if (productEvolutionExecutionStarted && !improvementLoopIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before product evolution.",
    });
  }

  if (productEvolutionExecutionStarted && !improvementLoopIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before product evolution.",
    });
  }

  if (productEvolutionExecutionStarted && !improvementLoopIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before product evolution.",
    });
  }

  if (productEvolutionExecutionStarted && !improvementLoopIntegrity.integrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before product-led growth.",
    });
  }

  if (productEvolutionExecutionStarted && !productEvolutionHonest) {
    violations.push({
      id: "product_evolution_started_without_improvement_loop",
      detail: productEvolutionCompleteFromPhases
        ? "SUSTAINED_PRODUCT_EVOLUTION_* env present but Improvement loop integrity FAIL — fix Phase J first."
        : "SUSTAINED_PRODUCT_EVOLUTION_* env present but era25 convergence + improvement loop are not complete — finish Step 10 first.",
    });
  }

  if (productEvolutionExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "improvement_loop_prerequisite_not_complete",
      detail: `Product evolution started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    ownershipMatrixReviewed &&
    productEvolutionExecutionStarted &&
    (!productEvolutionHonest || !improvementLoopIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_ownership_matrix_attestation",
      detail:
        "SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_REVIEWED=1 before honest Improvement loop — never attest ownership review without ops:validate-continuous-improvement-loop-integrity PASS.",
    });
  }

  if (competitor && productEvolutionExecutionStarted) {
    const recomputed = recomputeCompetitorMatrixProofStatusFromSummary(competitor);
    const recomputedOverall = resolveCompetitorMatrixOverall(recomputed);
    if (competitor.overall === "PASSED" && recomputedOverall !== "PASSED") {
      violations.push({
        id: "fake_competitor_matrix_pass",
        detail: `Competitor matrix overall PASSED but recomputed ${recomputedOverall} — never hand-edit PASS for leapfrog roadmap track.`,
      });
    }
    if (competitor.matrixProofStatus !== recomputed) {
      violations.push({
        id: "fake_competitor_matrix_proof_mismatch",
        detail: `matrixProofStatus=${competitor.matrixProofStatus} — recomputed ${recomputed} for ${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}.`,
      });
    }
  }

  if (baseline?.productEvolutionExecutionHonest && (!goHonest || !productEvolutionHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest product evolution at ${baseline.recordedAt} but GO/Improvement loop is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID,
    integrityPassed,
    productEvolutionExecutionStarted,
    productEvolutionComplete: productEvolutionHonest,
    improvementLoopActive,
    improvementLoopIntegrityPassed: improvementLoopIntegrity.integrityPassed,
    sustainedOpsIntegrityPassed: improvementLoopIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: improvementLoopIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: improvementLoopIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: improvementLoopIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: improvementLoopIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: improvementLoopIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: improvementLoopIntegrity.goIntegrityPassed,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    competitorArtifactPresent: competitor !== null,
    competitorOverall: competitor?.overall ?? null,
    recomputedMatrixProofStatus: competitor
      ? recomputeCompetitorMatrixProofStatusFromSummary(competitor)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-sustained-product-evolution-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run ops:validate-sustained-product-evolution -- --json",
      "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
      "npm run smoke:competitor-feature-gap-matrix",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
