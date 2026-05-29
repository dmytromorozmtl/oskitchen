/**
 * Pilot Week 1 execution integrity — blocks Week 1 without honest GO + metrics proof.
 * Policy: era28-pilot-week1-execution-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { evaluatePilotGoNoGoIntegrity } from "@/lib/commercial/pilot-gono-go-integrity-era28";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_WEEK1_TRACKED_ENV_KEYS,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import {
  recomputePilotBaselineProofStatusFromSummary,
  type PilotMetricsBaselineSummary,
} from "@/lib/commercial/pilot-metrics-baseline-summary";

export const PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID =
  "era28-pilot-week1-execution-integrity-v1" as const;

export const PILOT_WEEK1_EXECUTION_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/pilot-week1-execution-integrity-baseline.json" as const;

export type PilotWeek1ExecutionIntegrityViolationId =
  | "go_prerequisite_not_passed"
  | "go_integrity_fail"
  | "week1_started_without_honest_go"
  | "fake_metrics_pass"
  | "fake_metrics_overall_skipped"
  | "baseline_regression";

export type PilotWeek1ExecutionIntegrityViolation = {
  id: PilotWeek1ExecutionIntegrityViolationId;
  detail: string;
};

export type PilotWeek1ExecutionIntegrityBaseline = {
  week1ExecutionHonest: true;
  recordedAt: string;
  goDecision: "GO";
};

export type PilotWeek1ExecutionIntegritySummary = {
  policyId: typeof PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID;
  integrityPassed: boolean;
  week1ExecutionStarted: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  metricsArtifactPresent: boolean;
  metricsOverall: string | null;
  recomputedBaselineProofStatus: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly PilotWeek1ExecutionIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly PilotWeek1ExecutionIntegrityViolationId[] = [
  "go_prerequisite_not_passed",
  "go_integrity_fail",
  "week1_started_without_honest_go",
  "fake_metrics_pass",
  "fake_metrics_overall_skipped",
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

function readIntegrityBaseline(root: string): PilotWeek1ExecutionIntegrityBaseline | null {
  try {
    const path = join(root, PILOT_WEEK1_EXECUTION_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as PilotWeek1ExecutionIntegrityBaseline;
  } catch {
    return null;
  }
}

export function detectPilotWeek1ExecutionStarted(
  env: NodeJS.ProcessEnv = process.env,
  options?: {
    metricsBaseline?: PilotMetricsBaselineSummary | null;
    caseStudyPresent?: boolean;
  },
): boolean {
  const envStarted = PILOT_WEEK1_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
  const metricsStarted = options?.metricsBaseline !== undefined && options.metricsBaseline !== null;
  const caseStudyStarted = options?.caseStudyPresent === true;
  return envStarted || metricsStarted || caseStudyStarted;
}

export function evaluatePilotWeek1ExecutionIntegrity(
  root: string = process.cwd(),
  options?: {
    env?: NodeJS.ProcessEnv;
    goNoGoOverride?: PilotGoNoGoSummary | null;
    metricsBaselineOverride?: PilotMetricsBaselineSummary | null;
    caseStudyPresent?: boolean;
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    baselineOverride?: PilotWeek1ExecutionIntegrityBaseline | null;
  },
): PilotWeek1ExecutionIntegritySummary {
  const env = options?.env ?? process.env;
  const goNoGo =
    options?.goNoGoOverride !== undefined
      ? options.goNoGoOverride
      : readJsonFile<PilotGoNoGoSummary>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  const metrics =
    options?.metricsBaselineOverride !== undefined
      ? options.metricsBaselineOverride
      : readJsonFile<PilotMetricsBaselineSummary>(root, PILOT_METRICS_BASELINE_ARTIFACT_PATH);
  const caseStudyPresent =
    options?.caseStudyPresent ??
    existsSync(join(root, PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH));
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const goIntegrity = evaluatePilotGoNoGoIntegrity(root, {
    artifactOverride: goNoGo,
    p0ProofStatusOverride: options?.p0ProofStatusOverride,
    tier2ProofStatusOverride: options?.tier2ProofStatusOverride,
  });
  const goDecision = goNoGo?.decision ?? null;
  const goHonest = goDecision === "GO" && goIntegrity.integrityPassed;
  const week1ExecutionStarted = detectPilotWeek1ExecutionStarted(env, {
    metricsBaseline: metrics,
    caseStudyPresent,
  });

  const violations: PilotWeek1ExecutionIntegrityViolation[] = [];

  if (week1ExecutionStarted && !goHonest) {
    violations.push({
      id: "week1_started_without_honest_go",
      detail: `Week 1 env/artifacts present but GO is ${goDecision ?? "missing"} or GO integrity FAIL — complete Phase C first.`,
    });
  }

  if (goDecision === "GO" && !goIntegrity.integrityPassed) {
    violations.push({
      id: "go_integrity_fail",
      detail: "GO artifact fails pilot-gono-go integrity — fix before Week 1 execution train.",
    });
  }

  if (week1ExecutionStarted && goDecision !== "GO") {
    violations.push({
      id: "go_prerequisite_not_passed",
      detail: `Pilot Week 1 started but decision=${goDecision ?? "missing"} — smoke:pilot-gono-go must reach honest GO.`,
    });
  }

  if (metrics) {
    const recomputed = recomputePilotBaselineProofStatusFromSummary(metrics);
    if (metrics.overall === "PASSED" && recomputed !== "proof_captured") {
      violations.push({
        id: "fake_metrics_pass",
        detail: `Metrics overall PASSED but recomputed ${recomputed} — never hand-edit PASS.`,
      });
    }
    if (metrics.overall === "PASSED" && metrics.baselineProofStatus !== "proof_captured") {
      violations.push({
        id: "fake_metrics_overall_skipped",
        detail: `overall PASSED but baselineProofStatus=${metrics.baselineProofStatus} — SKIPPED ≠ PASS.`,
      });
    }
  }

  if (baseline?.week1ExecutionHonest && !goHonest) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded honest Week 1 at ${baseline.recordedAt} but GO is no longer honest.`,
    });
  }

  const integrityPassed = !violations.some((row) =>
    BLOCKING_VIOLATION_IDS.includes(row.id),
  );
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID,
    integrityPassed,
    week1ExecutionStarted,
    goDecision,
    goIntegrityPassed: goIntegrity.integrityPassed,
    metricsArtifactPresent: metrics !== null,
    metricsOverall: metrics?.overall ?? null,
    recomputedBaselineProofStatus: metrics
      ? recomputePilotBaselineProofStatusFromSummary(metrics)
      : null,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-pilot-week1-execution-integrity -- --json",
      "npm run ops:validate-pilot-gono-go-integrity -- --json",
      "npm run ops:validate-pilot-week1-env -- --json",
      "npm run ops:run-pilot-week1-execution-post-go-orchestrator -- --write",
      "npm run smoke:pilot-metrics-baseline",
    ],
  };
}
