/**
 * Commercial pilot path absolute end integrity — blocks Step 15 attestation without honest Post-terminus steady state.
 * Policy: era39-commercial-pilot-path-absolute-end-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import { detectCommercialPilotPathAbsoluteEndStarted } from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  evaluatePostTerminusSteadyStateIntegrity,
  type PostTerminusSteadyStateIntegrityBaseline,
} from "@/lib/commercial/post-terminus-steady-state-integrity-era38";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { MaintenanceModeIntegrityBaseline } from "@/lib/commercial/maintenance-mode-integrity-era36";
import type { EngineeringPathTerminusIntegrityBaseline } from "@/lib/commercial/engineering-path-terminus-integrity-era37";

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID =
  "era39-commercial-pilot-path-absolute-end-integrity-v1" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/commercial-pilot-path-absolute-end-integrity-baseline.json" as const;

export type CommercialPilotPathAbsoluteEndIntegrityViolationId =
  | "post_terminus_steady_state_prerequisite_not_complete"
  | "post_terminus_steady_state_integrity_fail"
  | "engineering_path_terminus_integrity_fail"
  | "maintenance_mode_integrity_fail"
  | "product_evolution_integrity_fail"
  | "improvement_loop_integrity_fail"
  | "sustained_ops_integrity_fail"
  | "market_leader_integrity_fail"
  | "series_a_integrity_fail"
  | "scale_integrity_fail"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "absolute_end_started_without_steady_state"
  | "fake_path_closure_attestation"
  | "fake_absolute_end_report_attestation"
  | "baseline_regression";

export type CommercialPilotPathAbsoluteEndIntegrityViolation = {
  id: CommercialPilotPathAbsoluteEndIntegrityViolationId;
  detail: string;
};

export type CommercialPilotPathAbsoluteEndIntegrityBaseline = {
  commercialPilotPathAbsoluteEndExecutionHonest: true;
  recordedAt: string;
  postTerminusSteadyStateCompleteAttested: true;
  goDecision: "GO";
};

export type CommercialPilotPathAbsoluteEndIntegritySummary = {
  policyId: typeof COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID;
  integrityPassed: boolean;
  commercialPilotPathAbsoluteEndExecutionStarted: boolean;
  commercialPilotPathAbsoluteEndComplete: boolean;
  postTerminusSteadyStateActive: boolean;
  postTerminusSteadyStateIntegrityPassed: boolean;
  engineeringPathTerminusIntegrityPassed: boolean;
  maintenanceModeIntegrityPassed: boolean;
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
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly CommercialPilotPathAbsoluteEndIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly CommercialPilotPathAbsoluteEndIntegrityViolationId[] = [
  "post_terminus_steady_state_prerequisite_not_complete",
  "post_terminus_steady_state_integrity_fail",
  "engineering_path_terminus_integrity_fail",
  "maintenance_mode_integrity_fail",
  "product_evolution_integrity_fail",
  "improvement_loop_integrity_fail",
  "sustained_ops_integrity_fail",
  "market_leader_integrity_fail",
  "series_a_integrity_fail",
  "scale_integrity_fail",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "absolute_end_started_without_steady_state",
  "fake_path_closure_attestation",
  "fake_absolute_end_report_attestation",
  "baseline_regression",
];

function readIntegrityBaseline(
  root: string,
): CommercialPilotPathAbsoluteEndIntegrityBaseline | null {
  try {
    const path = join(root, COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(
      readFileSync(path, "utf8"),
    ) as CommercialPilotPathAbsoluteEndIntegrityBaseline;
  } catch {
    return null;
  }
}

function parseEnvBoolean(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function evaluateCommercialPilotPathAbsoluteEndIntegrity(
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
    maintenanceModeIntegrityBaselineOverride?: MaintenanceModeIntegrityBaseline | null;
    engineeringPathTerminusIntegrityBaselineOverride?: EngineeringPathTerminusIntegrityBaseline | null;
    postTerminusSteadyStateIntegrityBaselineOverride?: PostTerminusSteadyStateIntegrityBaseline | null;
    baselineOverride?: CommercialPilotPathAbsoluteEndIntegrityBaseline | null;
  },
): CommercialPilotPathAbsoluteEndIntegritySummary {
  const env = options?.env ?? process.env;
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const postTerminusSteadyStateIntegrity = evaluatePostTerminusSteadyStateIntegrity(root, {
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
    maintenanceModeIntegrityBaselineOverride: options?.maintenanceModeIntegrityBaselineOverride,
    engineeringPathTerminusIntegrityBaselineOverride:
      options?.engineeringPathTerminusIntegrityBaselineOverride,
    baselineOverride: options?.postTerminusSteadyStateIntegrityBaselineOverride,
  });

  const goDecision = postTerminusSteadyStateIntegrity.goDecision;
  const goHonest = goDecision === "GO" && postTerminusSteadyStateIntegrity.goIntegrityPassed;
  const commercialPilotPathAbsoluteEndExecutionStarted =
    detectCommercialPilotPathAbsoluteEndStarted(env);
  const pathClosureAttested = parseEnvBoolean(
    env.COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PATH_CLOSURE_ATTESTED,
  );
  const reportReviewed = parseEnvBoolean(env.COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_REVIEWED);
  const commercialPilotPathAbsoluteEndHonest =
    postTerminusSteadyStateIntegrity.postTerminusSteadyStateComplete &&
    postTerminusSteadyStateIntegrity.integrityPassed;

  const violations: CommercialPilotPathAbsoluteEndIntegrityViolation[] = [];

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    goDecision === "GO" &&
    !postTerminusSteadyStateIntegrity.goIntegrityPassed
  ) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before absolute end attestation.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.week1IntegrityPassed
  ) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.month2IntegrityPassed
  ) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.scaleIntegrityPassed
  ) {
    violations.push({
      id: "scale_integrity_fail",
      detail: "Scale readiness integrity FAIL — complete Phase F before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.seriesAIntegrityPassed
  ) {
    violations.push({
      id: "series_a_integrity_fail",
      detail: "Series A / partner expansion integrity FAIL — complete Phase G before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.marketLeaderIntegrityPassed
  ) {
    violations.push({
      id: "market_leader_integrity_fail",
      detail: "Market leader positioning integrity FAIL — complete Phase H before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.sustainedOpsIntegrityPassed
  ) {
    violations.push({
      id: "sustained_ops_integrity_fail",
      detail: "Sustained operational excellence integrity FAIL — complete Phase I before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.improvementLoopIntegrityPassed
  ) {
    violations.push({
      id: "improvement_loop_integrity_fail",
      detail: "Continuous improvement loop integrity FAIL — complete Phase J before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.productEvolutionIntegrityPassed
  ) {
    violations.push({
      id: "product_evolution_integrity_fail",
      detail: "Sustained product evolution integrity FAIL — complete Phase K before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.maintenanceModeIntegrityPassed
  ) {
    violations.push({
      id: "maintenance_mode_integrity_fail",
      detail: "Maintenance mode integrity FAIL — complete Phase L before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.engineeringPathTerminusIntegrityPassed
  ) {
    violations.push({
      id: "engineering_path_terminus_integrity_fail",
      detail: "Engineering path terminus integrity FAIL — complete Phase M before absolute end.",
    });
  }

  if (
    commercialPilotPathAbsoluteEndExecutionStarted &&
    !postTerminusSteadyStateIntegrity.integrityPassed
  ) {
    violations.push({
      id: "post_terminus_steady_state_integrity_fail",
      detail: "Post-terminus steady state integrity FAIL — complete Phase N before Step 15 absolute end.",
    });
  }

  if (commercialPilotPathAbsoluteEndExecutionStarted && !commercialPilotPathAbsoluteEndHonest) {
    violations.push({
      id: "absolute_end_started_without_steady_state",
      detail: postTerminusSteadyStateIntegrity.postTerminusSteadyStateComplete
        ? "COMMERCIAL_PILOT_PATH_ABSOLUTE_END_* env present but Post-terminus steady state integrity FAIL — fix Phase N first."
        : "COMMERCIAL_PILOT_PATH_ABSOLUTE_END_* env present but Step 14 steady state is not complete — finish operator loop first.",
    });
  }

  if (commercialPilotPathAbsoluteEndExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "post_terminus_steady_state_prerequisite_not_complete",
      detail: `Commercial pilot path absolute end started but GO decision=${goDecision ?? "missing"} — ${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} must remain honest GO.`,
    });
  }

  if (
    pathClosureAttested &&
    commercialPilotPathAbsoluteEndExecutionStarted &&
    (!commercialPilotPathAbsoluteEndHonest || !postTerminusSteadyStateIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_path_closure_attestation",
      detail:
        "COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PATH_CLOSURE_ATTESTED=1 before honest Post-terminus steady state — never attest path closure without ops:validate-post-terminus-steady-state-integrity PASS.",
    });
  }

  if (
    reportReviewed &&
    commercialPilotPathAbsoluteEndExecutionStarted &&
    (!commercialPilotPathAbsoluteEndHonest || !postTerminusSteadyStateIntegrity.integrityPassed)
  ) {
    violations.push({
      id: "fake_absolute_end_report_attestation",
      detail:
        "COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_REVIEWED=1 before honest Post-terminus steady state — never attest absolute end report without ops:validate-commercial-pilot-path-absolute-end-integrity PASS.",
    });
  }

  if (
    baseline?.commercialPilotPathAbsoluteEndExecutionHonest &&
    (!goHonest || !commercialPilotPathAbsoluteEndHonest)
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest absolute end at ${baseline.recordedAt} but GO/Post-terminus steady state is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID,
    integrityPassed,
    commercialPilotPathAbsoluteEndExecutionStarted,
    commercialPilotPathAbsoluteEndComplete: commercialPilotPathAbsoluteEndHonest,
    postTerminusSteadyStateActive: postTerminusSteadyStateIntegrity.postTerminusSteadyStateComplete,
    postTerminusSteadyStateIntegrityPassed: postTerminusSteadyStateIntegrity.integrityPassed,
    engineeringPathTerminusIntegrityPassed:
      postTerminusSteadyStateIntegrity.engineeringPathTerminusIntegrityPassed,
    maintenanceModeIntegrityPassed: postTerminusSteadyStateIntegrity.maintenanceModeIntegrityPassed,
    productEvolutionIntegrityPassed: postTerminusSteadyStateIntegrity.productEvolutionIntegrityPassed,
    improvementLoopIntegrityPassed: postTerminusSteadyStateIntegrity.improvementLoopIntegrityPassed,
    sustainedOpsIntegrityPassed: postTerminusSteadyStateIntegrity.sustainedOpsIntegrityPassed,
    marketLeaderIntegrityPassed: postTerminusSteadyStateIntegrity.marketLeaderIntegrityPassed,
    seriesAIntegrityPassed: postTerminusSteadyStateIntegrity.seriesAIntegrityPassed,
    scaleIntegrityPassed: postTerminusSteadyStateIntegrity.scaleIntegrityPassed,
    month2IntegrityPassed: postTerminusSteadyStateIntegrity.month2IntegrityPassed,
    week1IntegrityPassed: postTerminusSteadyStateIntegrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: postTerminusSteadyStateIntegrity.goIntegrityPassed,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json",
      "npm run ops:validate-post-terminus-steady-state-integrity -- --json",
      "npm run ops:validate-commercial-pilot-path-absolute-end -- --json",
      "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
      "npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write",
      "npm run test:ci:commercial-pilot-runbook:cert",
    ],
  };
}
