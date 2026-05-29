/**
 * Scale readiness integrity — blocks Scale without honest Month 2 + rollback proof.
 * Policy: era30-scale-readiness-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import {
  evaluateMonth2MarketReadinessIntegrity,
  type Month2MarketReadinessIntegrityBaseline,
} from "@/lib/commercial/month2-market-readiness-integrity-era29";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import {
  recomputePilotRollbackProofStatusFromSummary,
  type PilotRollbackDrillSummary,
} from "@/lib/commercial/pilot-rollback-drill-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  resolveMonth2CompleteForScale,
  SCALE_READINESS_TRACKED_ENV_KEYS,
} from "@/lib/commercial/scale-readiness-phases-era21";
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH } from "@/lib/commercial/month2-market-readiness-phases-era21";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { PilotWeek1ExecutionIntegrityBaseline } from "@/lib/commercial/pilot-week1-execution-integrity-era28";

export const SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID =
  "era30-scale-readiness-integrity-v1" as const;

export const SCALE_READINESS_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/scale-readiness-integrity-baseline.json" as const;

export type ScaleReadinessIntegrityViolationId =
  | "month2_prerequisite_not_complete"
  | "month2_integrity_fail"
  | "week1_integrity_fail"
  | "go_integrity_fail"
  | "scale_started_without_month2"
  | "fake_rollback_pass"
  | "fake_rollback_proof_mismatch"
  | "baseline_regression";

export type ScaleReadinessIntegrityViolation = {
  id: ScaleReadinessIntegrityViolationId;
  detail: string;
};

export type ScaleReadinessIntegrityBaseline = {
  scaleExecutionHonest: true;
  recordedAt: string;
  month2CompleteAttested: true;
  goDecision: "GO";
};

export type ScaleReadinessIntegritySummary = {
  policyId: typeof SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID;
  integrityPassed: boolean;
  scaleExecutionStarted: boolean;
  month2Complete: boolean;
  month2IntegrityPassed: boolean;
  week1IntegrityPassed: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  rollbackArtifactPresent: boolean;
  rollbackProofStatus: string | null;
  recomputedRollbackProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly ScaleReadinessIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly ScaleReadinessIntegrityViolationId[] = [
  "month2_prerequisite_not_complete",
  "month2_integrity_fail",
  "week1_integrity_fail",
  "go_integrity_fail",
  "scale_started_without_month2",
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

function readIntegrityBaseline(root: string): ScaleReadinessIntegrityBaseline | null {
  try {
    const path = join(root, SCALE_READINESS_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as ScaleReadinessIntegrityBaseline;
  } catch {
    return null;
  }
}

export function detectScaleReadinessStarted(
  env: NodeJS.ProcessEnv = process.env,
  options?: {
    rollbackDrill?: PilotRollbackDrillSummary | null;
  },
): boolean {
  const envStarted = SCALE_READINESS_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
  const rollbackStarted = options?.rollbackDrill !== undefined && options.rollbackDrill !== null;
  return envStarted || rollbackStarted;
}

export function evaluateScaleReadinessIntegrity(
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
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    week1IntegrityBaselineOverride?: PilotWeek1ExecutionIntegrityBaseline | null;
    month2IntegrityBaselineOverride?: Month2MarketReadinessIntegrityBaseline | null;
    baselineOverride?: ScaleReadinessIntegrityBaseline | null;
  },
): ScaleReadinessIntegritySummary {
  const env = options?.env ?? process.env;
  const goNoGo =
    options?.goNoGoOverride !== undefined
      ? options.goNoGoOverride
      : readJsonFile<PilotGoNoGoSummary>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
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
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const month2Integrity = evaluateMonth2MarketReadinessIntegrity(root, {
    env,
    goNoGoOverride: goNoGo,
    metricsBaselineOverride: metrics,
    caseStudyDraftOverride: caseStudy,
    investorOnepagerOverride: investor,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
    week1IntegrityBaselineOverride: options?.week1IntegrityBaselineOverride,
    baselineOverride: options?.month2IntegrityBaselineOverride,
  });

  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && month2Integrity.goIntegrityPassed;
  const month2CompleteFromPhases = resolveMonth2CompleteForScale({
    goNoGoSummary: goNoGo,
    metricsBaseline: metrics,
    caseStudyDraft: caseStudy,
    investorOnepager: investor,
    env,
  });
  const month2Honest = month2CompleteFromPhases && month2Integrity.integrityPassed;
  const scaleExecutionStarted = detectScaleReadinessStarted(env, { rollbackDrill: rollback });

  const violations: ScaleReadinessIntegrityViolation[] = [];

  if (scaleExecutionStarted && goDecision === "GO" && !month2Integrity.goIntegrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before Scale readiness train.",
    });
  }

  if (scaleExecutionStarted && !month2Integrity.week1IntegrityPassed) {
    violations.push({
      id: "week1_integrity_fail",
      detail: "Pilot Week 1 execution integrity FAIL — complete Phase D before Scale expansion.",
    });
  }

  if (scaleExecutionStarted && !month2Integrity.integrityPassed) {
    violations.push({
      id: "month2_integrity_fail",
      detail: "Month 2 market readiness integrity FAIL — complete Phase E before Scale gates.",
    });
  }

  if (scaleExecutionStarted && !month2Honest) {
    violations.push({
      id: "scale_started_without_month2",
      detail: month2CompleteFromPhases
        ? "Scale env/artifacts present but Month 2 integrity FAIL — fix Phase E before enterprise gates."
        : "Scale env/artifacts present but Month 2 is not complete — finish Month 2 workstreams first.",
    });
  }

  if (scaleExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "month2_prerequisite_not_complete",
      detail: `Scale started but GO decision=${goDecision ?? "missing"} — smoke:pilot-gono-go must remain honest GO.`,
    });
  }

  if (rollback) {
    const recomputed = recomputePilotRollbackProofStatusFromSummary(rollback);
    if (rollback.rollbackProofStatus === "proof_passed" && recomputed !== "proof_passed") {
      violations.push({
        id: "fake_rollback_pass",
        detail: `Rollback proof_passed but recomputed ${recomputed} — never hand-edit drill PASS.`,
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

  if (baseline?.scaleExecutionHonest && (!goHonest || !month2Honest)) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Scale at ${baseline.recordedAt} but GO/Month 2 is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) => BLOCKING_VIOLATION_IDS.includes(row.id));
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID,
    integrityPassed,
    scaleExecutionStarted,
    month2Complete: month2Honest,
    month2IntegrityPassed: month2Integrity.integrityPassed,
    week1IntegrityPassed: month2Integrity.week1IntegrityPassed,
    goDecision,
    goIntegrityPassed: month2Integrity.goIntegrityPassed,
    rollbackArtifactPresent: rollback !== null,
    rollbackProofStatus: rollback?.rollbackProofStatus ?? null,
    recomputedRollbackProofStatus: rollback
      ? recomputePilotRollbackProofStatusFromSummary(rollback)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-scale-readiness-integrity -- --json",
      "npm run ops:validate-month2-market-readiness-integrity -- --json",
      "npm run ops:validate-scale-readiness-env -- --json",
      "npm run ops:run-scale-readiness-post-month2-orchestrator -- --write",
      "npm run smoke:pilot-rollback-drill",
    ],
  };
}
