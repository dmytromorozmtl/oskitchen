/**
 * Maintenance mode integrity — blocks commercial pilot path attestation without honest Product evolution.
 * Policy: era36-maintenance-mode-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import {
  resolveProductEvolutionReady,
  resolveMaintenanceModePrerequisites,
  detectMaintenanceModeStarted,
} from "@/lib/commercial/maintenance-mode-phases-era24";
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
  evaluateSustainedProductEvolutionIntegrity,
  type SustainedProductEvolutionIntegrityBaseline,
} from "@/lib/commercial/sustained-product-evolution-integrity-era35";
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import { resolveEra25PureOperationalModeContext } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID =
  "era36-maintenance-mode-integrity-v1" as const;

export const MAINTENANCE_MODE_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/maintenance-mode-integrity-baseline.json" as const;

export type MaintenanceModeIntegrityViolationId =
  | "product_evolution_prerequisite_not_complete"
  | "product_evolution_integrity_fail"
  | "improvement_loop_integrity_fail"
  | "sustained_ops_integrity_fail"
  | "market_leader_integrity_fail"
  | "series_a_integrity_fail"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "maintenance_started_without_product_evolution"
  | "fake_rhythm_calendar_attestation"
  | "fake_metrics_pass"
  | "fake_metrics_proof_mismatch"
  | "baseline_regression";

export type MaintenanceModeIntegrityViolation = {
  id: MaintenanceModeIntegrityViolationId;
  detail: string;
};

export type MaintenanceModeIntegrityBaseline = {
  maintenanceModeExecutionHonest: true;
  recordedAt: string;
  productEvolutionCompleteAttested: true;
  goDecision: "GO";
};

export type MaintenanceModeIntegritySummary = {
  policyId: typeof MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID;
  integrityPassed: boolean;
  maintenanceModeExecutionStarted: boolean;
  maintenanceModeComplete: boolean;
  productEvolutionReady: boolean;
  productEvolutionIntegrityPassed: boolean;
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
  metricsArtifactPresent: boolean;
  metricsOverall: string | null;
  recomputedBaselineProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly MaintenanceModeIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly MaintenanceModeIntegrityViolationId[] = [
  "product_evolution_prerequisite_not_complete",
  "product_evolution_integrity_fail",
  "improvement_loop_integrity_fail",
  "sustained_ops_integrity_fail",
  "market_leader_integrity_fail",
  "series_a_integrity_fail",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "maintenance_started_without_product_evolution",
  "fake_rhythm_calendar_attestation",
  "fake_metrics_pass",
  "fake_metrics_proof_mismatch",
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

function readIntegrityBaseline(root: string): MaintenanceModeIntegrityBaseline | null {
  try {
    const path = join(root, MAINTENANCE_MODE_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as MaintenanceModeIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateMaintenanceModeIntegrity(
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
    productEvolutionIntegrityBaselineOverride?: SustainedProductEvolutionIntegrityBaseline | null;
    baselineOverride?: MaintenanceModeIntegrityBaseline | null;
  },
): MaintenanceModeIntegritySummary {
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

  const productEvolutionIntegrity = evaluateSustainedProductEvolutionIntegrity(root, {
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
    baselineOverride: options?.productEvolutionIntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && productEvolutionIntegrity.goIntegrityPassed;
  const era25 = resolveEra25PureOperationalModeContext(env);
  const productEvolutionReady = resolveProductEvolutionReady({
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
  const prerequisites = resolveMaintenanceModePrerequisites({
    goDecision,
    productEvolutionReady,
    era25,
  });
  const maintenanceModeCompleteFromPhases = prerequisites.maintenanceModeActive;
  const maintenanceModeHonest =
    maintenanceModeCompleteFromPhases && productEvolutionIntegrity.integrityPassed;
  const maintenanceModeExecutionStarted = detectMaintenanceModeStarted(env);
  const rhythmCalendarReviewed = parseEnvBoolean(env.MAINTENANCE_MODE_RHYTHM_CALENDAR_REVIEWED);

  const violations: MaintenanceModeIntegrityViolation[] = [];

  if (maintenanceModeExecutionStarted && goDecision === "GO" && !productEvolutionIntegrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before maintenance mode attestation.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before maintenance mode.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.month2IntegrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before maintenance mode.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.scaleIntegrityPassed) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before maintenance mode.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.seriesAIntegrityPassed) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before maintenance mode.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.marketLeaderIntegrityPassed) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before maintenance mode.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.sustainedOpsIntegrityPassed) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before maintenance mode.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.improvementLoopIntegrityPassed) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before maintenance mode.",
    });
  }

  if (maintenanceModeExecutionStarted && !productEvolutionIntegrity.integrityPassed) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before commercial pilot path attestation.",
    });
  }

  if (maintenanceModeExecutionStarted && !maintenanceModeHonest) {
    violations.push({
      id: "maintenance_started_without_product_evolution",
      detail: maintenanceModeCompleteFromPhases
        ? "MAINTENANCE_MODE_* env present but Product evolution integrity FAIL — fix Phase K first."
        : "MAINTENANCE_MODE_* env present but Step 11 product evolution is not complete — finish product-led growth first.",
    });
  }

  if (maintenanceModeExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "product_evolution_prerequisite_not_complete",
      detail: `Maintenance mode started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    rhythmCalendarReviewed &&
    maintenanceModeExecutionStarted &&
    (!maintenanceModeHonest || !productEvolutionIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_rhythm_calendar_attestation",
      detail:
        "MAINTENANCE_MODE_RHYTHM_CALENDAR_REVIEWED=1 before honest Product evolution — never attest rhythm calendar without ops:validate-sustained-product-evolution-integrity PASS.",
    });
  }

  if (metrics && maintenanceModeExecutionStarted) {
    const recomputed = recomputePilotBaselineProofStatusFromSummary(metrics);
    const recomputedOverall = resolvePilotMetricsBaselineOverall(recomputed);
    if (metrics.overall === "PASSED" && recomputedOverall !== "PASSED") {
      violations.push({
        id: "fake_metrics_pass",
        detail: `Metrics baseline overall PASSED but recomputed ${recomputedOverall} — never hand-edit PASS for monthly W1/W2 rhythms.`,
      });
    }
    if (metrics.baselineProofStatus !== recomputed) {
      violations.push({
        id: "fake_metrics_proof_mismatch",
        detail: `overall=${metrics.overall} but baselineProofStatus=${metrics.baselineProofStatus} — recomputed ${recomputed}.`,
      });
    }
  }

  if (baseline?.maintenanceModeExecutionHonest && (!goHonest || !maintenanceModeHonest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest maintenance mode at ${baseline.recordedAt} but GO/Product evolution is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID,
    integrityPassed,
    maintenanceModeExecutionStarted,
    maintenanceModeComplete: maintenanceModeHonest,
    productEvolutionReady,
    productEvolutionIntegrityPassed: productEvolutionIntegrity.integrityPassed,
    improvementLoopIntegrityPassed: productEvolutionIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: productEvolutionIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: productEvolutionIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: productEvolutionIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: productEvolutionIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: productEvolutionIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: productEvolutionIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: productEvolutionIntegrity.goIntegrityPassed,
    sustainedOpsConvergenceReady: prerequisites.sustainedOpsConvergenceReady,
    metricsArtifactPresent: metrics !== null,
    metricsOverall: metrics?.overall ?? null,
    recomputedBaselineProofStatus: metrics
      ? recomputePilotBaselineProofStatusFromSummary(metrics)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-maintenance-mode-integrity -- --json",
      "npm run ops:validate-sustained-product-evolution-integrity -- --json",
      "npm run ops:validate-maintenance-mode -- --json",
      "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
      "npm run smoke:pilot-metrics-baseline",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
