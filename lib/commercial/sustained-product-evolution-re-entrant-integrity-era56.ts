/**
 * Sustained product evolution re-entrant integrity — product growth only via improvement loop after train closure.
 * Policy: era56-sustained-product-evolution-re-entrant-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity,
  type Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55";
import { detectEra25CommercialPilotConvergenceTrainClosureStarted } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-phases-era25";
import { evaluateSustainedProductEvolutionIntegrity } from "@/lib/commercial/sustained-product-evolution-integrity-era35";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import {
  detectEra25LinearConvergenceSurfaceReopened,
  detectSustainedProductEvolutionReentrantStarted,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-phases-era56";
import { resolveContinuousImprovementLoopActive } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID =
  "era56-sustained-product-evolution-re-entrant-integrity-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/sustained-product-evolution-re-entrant-integrity-baseline.json" as const;

export type SustainedProductEvolutionReentrantIntegrityViolationId =
  | "era25_commercial_pilot_convergence_train_closure_integrity_fail"
  | "sustained_product_evolution_integrity_fail"
  | "improvement_loop_not_active"
  | "go_integrity_fail"
  | "reentrant_evolution_without_train_closure"
  | "linear_convergence_surface_reopened"
  | "fake_reentrant_attestation"
  | "fake_reentrant_report_attestation"
  | "baseline_regression";

export type SustainedProductEvolutionReentrantIntegrityViolation = {
  id: SustainedProductEvolutionReentrantIntegrityViolationId;
  detail: string;
};

export type SustainedProductEvolutionReentrantIntegrityBaseline = {
  sustainedProductEvolutionReentrantHonest: true;
  recordedAt: string;
  trainClosureCompleteAttested: true;
  improvementLoopActiveAttested: true;
  goDecision: "GO";
};

export type SustainedProductEvolutionReentrantIntegritySummary = {
  policyId: typeof SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID;
  integrityPassed: boolean;
  sustainedProductEvolutionReentrantExecutionStarted: boolean;
  sustainedProductEvolutionReentrantComplete: boolean;
  era25CommercialPilotConvergenceTrainClosureComplete: boolean;
  era25CommercialPilotConvergenceTrainClosureIntegrityPassed: boolean;
  improvementLoopActive: boolean;
  sustainedProductEvolutionIntegrityPassed: boolean;
  linearConvergenceSurfaceReopened: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly SustainedProductEvolutionReentrantIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly SustainedProductEvolutionReentrantIntegrityViolationId[] = [
  "era25_commercial_pilot_convergence_train_closure_integrity_fail",
  "sustained_product_evolution_integrity_fail",
  "improvement_loop_not_active",
  "go_integrity_fail",
  "reentrant_evolution_without_train_closure",
  "linear_convergence_surface_reopened",
  "fake_reentrant_attestation",
  "fake_reentrant_report_attestation",
  "baseline_regression",
];

function readReentrantIntegrityBaseline(
  root: string,
): SustainedProductEvolutionReentrantIntegrityBaseline | null {
  try {
    const path = join(root, SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as SustainedProductEvolutionReentrantIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function pushUpstreamTrainClosureViolations(
  violations: SustainedProductEvolutionReentrantIntegrityViolation[],
  trainClosureIntegrity: ReturnType<typeof evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity>,
): void {
  if (!trainClosureIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before re-entrant product evolution attest.",
    });
  }
  if (!trainClosureIntegrity.integrityPassed) {
    violations.push({
      id: "era25_commercial_pilot_convergence_train_closure_integrity_fail",
      detail: "Era25 commercial pilot convergence train closure integrity FAIL — complete Phase AE before re-entrant evolution.",
    });
  }
}

export function evaluateSustainedProductEvolutionReentrantIntegrity(
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
    trainClosureIntegrityBaselineOverride?: Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline | null;
    baselineOverride?: SustainedProductEvolutionReentrantIntegrityBaseline | null;
  },
): SustainedProductEvolutionReentrantIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readReentrantIntegrityBaseline(root);

  const trainClosureIntegrity = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity(root, {
    env,
    goNoGoOverride: options?.goNoGoOverride,
    p0StagingOverride: options?.p0StagingOverride,
    tier2SummaryOverride: options?.tier2SummaryOverride,
    metricsBaselineOverride: options?.metricsBaselineOverride,
    caseStudyDraftOverride: options?.caseStudyDraftOverride,
    investorOnepagerOverride: options?.investorOnepagerOverride,
    rollbackDrillOverride: options?.rollbackDrillOverride,
    competitorMatrixOverride: options?.competitorMatrixOverride,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
    baselineOverride: options?.trainClosureIntegrityBaselineOverride,
  });

  const productEvolutionIntegrity = evaluateSustainedProductEvolutionIntegrity(root, {
    env,
    goNoGoOverride: options?.goNoGoOverride,
    p0StagingOverride: options?.p0StagingOverride,
    tier2SummaryOverride: options?.tier2SummaryOverride,
    metricsBaselineOverride: options?.metricsBaselineOverride,
    caseStudyDraftOverride: options?.caseStudyDraftOverride,
    investorOnepagerOverride: options?.investorOnepagerOverride,
    rollbackDrillOverride: options?.rollbackDrillOverride,
    competitorMatrixOverride: options?.competitorMatrixOverride,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
  });

  const improvementLoopActive = resolveContinuousImprovementLoopActive({
    goNoGoSummary: options?.goNoGoOverride ?? null,
    p0Staging: options?.p0StagingOverride ?? null,
    tier2Summary: options?.tier2SummaryOverride ?? null,
    metricsBaseline: options?.metricsBaselineOverride ?? null,
    caseStudyDraft: options?.caseStudyDraftOverride ?? null,
    investorOnepager: options?.investorOnepagerOverride ?? null,
    rollbackDrill: options?.rollbackDrillOverride ?? null,
    competitorMatrix: options?.competitorMatrixOverride ?? null,
    env,
  });

  const goDecision = trainClosureIntegrity.goDecision;
  const goHonest = goDecision === "GO" && trainClosureIntegrity.goIntegrityPassed;
  const sustainedProductEvolutionReentrantExecutionStarted =
    detectSustainedProductEvolutionReentrantStarted(env);
  const reentrantAttested = parseEnvBoolean(env.SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED);
  const reportReviewed = parseEnvBoolean(
    env.SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_REPORT_REVIEWED,
  );
  const linearConvergenceSurfaceReopened = detectEra25LinearConvergenceSurfaceReopened(env);
  const trainClosureComplete =
    trainClosureIntegrity.era25CommercialPilotConvergenceTrainClosureComplete &&
    trainClosureIntegrity.integrityPassed;
  const reentrantHonest =
    trainClosureComplete &&
    improvementLoopActive &&
    productEvolutionIntegrity.integrityPassed &&
    !linearConvergenceSurfaceReopened;

  const violations: SustainedProductEvolutionReentrantIntegrityViolation[] = [];

  if (sustainedProductEvolutionReentrantExecutionStarted) {
    pushUpstreamTrainClosureViolations(violations, trainClosureIntegrity);
  }

  if (sustainedProductEvolutionReentrantExecutionStarted && !productEvolutionIntegrity.integrityPassed) {
    violations.push({
      id: "sustained_product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete improvement-loop orchestration before re-entrant attest.",
    });
  }

  if (sustainedProductEvolutionReentrantExecutionStarted && !improvementLoopActive) {
    violations.push({
      id: "improvement_loop_not_active",
      detail: "Re-entrant product evolution started but continuous improvement loop prerequisites are not active — finish Step 10 first.",
    });
  }

  if (sustainedProductEvolutionReentrantExecutionStarted && !trainClosureComplete) {
    violations.push({
      id: "reentrant_evolution_without_train_closure",
      detail: "SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_* env present but era25 commercial pilot convergence train closure is not honest — complete Phase AE first.",
    });
  }

  const trainClosurePathActive =
    trainClosureIntegrity.era25CommercialPilotConvergenceTrainClosureComplete ||
    detectEra25CommercialPilotConvergenceTrainClosureStarted(env);

  if (trainClosurePathActive && linearConvergenceSurfaceReopened) {
    violations.push({
      id: "linear_convergence_surface_reopened",
      detail:
        "Era25 linear convergence phase env keys detected after train closure — remove PAID_PILOT_GO / WEEK1 / MONTH2 / SCALE / SERIES_A / MARKET_LEADER / SUSTAINED_OPS convergence attestations; use improvement loop + re-entrant path only.",
    });
  }

  if (sustainedProductEvolutionReentrantExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_integrity_fail",
      detail: `Re-entrant evolution started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (reentrantAttested && sustainedProductEvolutionReentrantExecutionStarted && !reentrantHonest) {
    violations.push({
      id: "fake_reentrant_attestation",
      detail:
        "SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED=1 before honest train closure + improvement loop + product evolution integrity — never attest without ops:validate-sustained-product-evolution-re-entrant-integrity PASS.",
    });
  }

  if (reportReviewed && sustainedProductEvolutionReentrantExecutionStarted && !reentrantHonest) {
    violations.push({
      id: "fake_reentrant_report_attestation",
      detail:
        "SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_REPORT_REVIEWED=1 before re-entrant integrity PASS — never attest report without ops:validate-sustained-product-evolution-re-entrant-integrity PASS.",
    });
  }

  if (
    baseline?.sustainedProductEvolutionReentrantHonest &&
    (!goHonest || !trainClosureComplete || !improvementLoopActive || linearConvergenceSurfaceReopened)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest re-entrant evolution at ${baseline.recordedAt} but train closure / improvement loop / linear-surface guard is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID,
    integrityPassed,
    sustainedProductEvolutionReentrantExecutionStarted,
    sustainedProductEvolutionReentrantComplete: reentrantHonest && productEvolutionIntegrity.integrityPassed,
    era25CommercialPilotConvergenceTrainClosureComplete:
      trainClosureIntegrity.era25CommercialPilotConvergenceTrainClosureComplete,
    era25CommercialPilotConvergenceTrainClosureIntegrityPassed: trainClosureIntegrity.integrityPassed,
    improvementLoopActive,
    sustainedProductEvolutionIntegrityPassed: productEvolutionIntegrity.integrityPassed,
    linearConvergenceSurfaceReopened,
    goDecision,
    goIntegrityPassed: trainClosureIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json",
      "npm run ops:validate-era25-commercial-pilot-convergence-train-closure-integrity -- --json",
      "npm run ops:validate-sustained-product-evolution-integrity -- --json",
      "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
      "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
