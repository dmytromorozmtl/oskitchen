/**
 * Era 20 — Pilot metrics baseline, rollback drill, and support checklist aggregation.
 */

import { ERA20_PILOT_EXECUTION_READINESS_POLICY_ID } from "@/lib/commercial/era20-pilot-execution-readiness-policy";
import type { PilotGoNoGoEvidenceGate } from "@/lib/commercial/pilot-gono-go-summary";
import { PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS } from "@/lib/commercial/pilot-metrics-baseline-era17-policy";

export type PilotMetricsBaselineGoNoGoArtifact = {
  overall?: string;
  baselineProofStatus?: string;
  capturedCount?: number;
  missingCount?: number;
};

export type PilotRollbackDrillGoNoGoArtifact = {
  rollbackProofStatus?: string;
  drillMode?: string;
  passedStepCount?: number;
  totalSteps?: number;
};

export type Era20PilotSupportChecklistItemId =
  | "gono_go_artifact"
  | "forbidden_claims_passed"
  | "rollback_drill_passed"
  | "metrics_baseline_captured"
  | "p0_staging_proof_passed"
  | "weekly_support_rhythm";

export type Era20PilotSupportChecklistItemStatus = "done" | "pending" | "not_applicable";

export type Era20PilotSupportChecklistRow = {
  id: Era20PilotSupportChecklistItemId;
  label: string;
  status: Era20PilotSupportChecklistItemStatus;
  detail: string;
};

export type Era20PilotExecutionReadinessSlice = {
  policyId: typeof ERA20_PILOT_EXECUTION_READINESS_POLICY_ID;
  headline: string;
  metricsGate: PilotGoNoGoEvidenceGate;
  rollbackGate: PilotGoNoGoEvidenceGate;
  supportChecklist: Era20PilotSupportChecklistRow[];
  supportChecklistDoneCount: number;
  supportChecklistTotal: number;
  successMetricIds: readonly string[];
};

export const ERA20_PILOT_SUCCESS_METRIC_IDS = PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS.map(
  (row) => row.id,
);

export function derivePilotMetricsBaselineGate(
  artifact: PilotMetricsBaselineGoNoGoArtifact | null | undefined,
): PilotGoNoGoEvidenceGate {
  if (!artifact) {
    return {
      id: "pilot_metrics_baseline",
      label: "Pilot metrics baseline (Week 1+)",
      pass: false,
      reason:
        "artifacts/pilot-metrics-baseline-summary.json missing — run npm run smoke:pilot-metrics-baseline after kickoff",
    };
  }
  const pass = artifact.overall === "PASSED";
  return {
    id: "pilot_metrics_baseline",
    label: "Pilot metrics baseline (Week 1+)",
    pass,
    reason: pass
      ? `overall PASSED — ${artifact.capturedCount ?? 0} metric(s) captured`
      : `overall=${artifact.overall ?? "unknown"} baselineProofStatus=${artifact.baselineProofStatus ?? "unknown"} — capture pilot week data before external KPI claims`,
  };
}

export function derivePilotRollbackDrillGate(
  artifact: PilotRollbackDrillGoNoGoArtifact | null | undefined,
): PilotGoNoGoEvidenceGate {
  if (!artifact) {
    return {
      id: "pilot_rollback_drill",
      label: "Pilot rollback drill",
      pass: false,
      reason:
        "artifacts/pilot-rollback-drill-summary.json missing — run npm run smoke:pilot-rollback-drill (tabletop or staging)",
    };
  }
  const pass = artifact.rollbackProofStatus === "proof_passed";
  return {
    id: "pilot_rollback_drill",
    label: "Pilot rollback drill",
    pass,
    reason: pass
      ? `rollbackProofStatus proof_passed — ${artifact.passedStepCount ?? 0}/${artifact.totalSteps ?? 0} steps (${artifact.drillMode ?? "unset"} mode)`
      : `rollbackProofStatus=${artifact.rollbackProofStatus ?? "unknown"} — complete rollback tabletop before paid pilot traffic`,
  };
}

export function buildEra20PilotSupportChecklist(input: {
  goNoGoArtifactPresent: boolean;
  forbiddenClaimsPassed: boolean;
  metricsGatePass: boolean;
  rollbackGatePass: boolean;
  p0ProofPassed: boolean;
}): Era20PilotSupportChecklistRow[] {
  return [
    {
      id: "gono_go_artifact",
      label: "GO/NO-GO summary artifact on disk",
      status: input.goNoGoArtifactPresent ? "done" : "pending",
      detail: input.goNoGoArtifactPresent
        ? "artifacts/pilot-gono-go-summary.json present"
        : "Run npm run smoke:pilot-gono-go",
    },
    {
      id: "forbidden_claims_passed",
      label: "Forbidden claims enforcement passed",
      status: input.forbiddenClaimsPassed ? "done" : "pending",
      detail: input.forbiddenClaimsPassed
        ? "Pre-sales claims gate PASSED"
        : "Run npm run smoke:pilot-forbidden-claims-enforcement",
    },
    {
      id: "rollback_drill_passed",
      label: "Rollback drill executed (tabletop or staging)",
      status: input.rollbackGatePass ? "done" : "pending",
      detail: input.rollbackGatePass
        ? "rollbackProofStatus proof_passed"
        : "Run npm run smoke:pilot-rollback-drill before kickoff",
    },
    {
      id: "metrics_baseline_captured",
      label: "Pilot metrics baseline captured (Week 1+)",
      status: input.metricsGatePass ? "done" : "pending",
      detail: input.metricsGatePass
        ? "pilot-metrics-baseline-summary overall PASSED"
        : "Expected SKIPPED pre-kickoff — capture after Week 1",
    },
    {
      id: "p0_staging_proof_passed",
      label: "P0 staging proof passed",
      status: input.p0ProofPassed ? "done" : "pending",
      detail: input.p0ProofPassed
        ? "p0ProofStatus proof_passed"
        : "Configure 11 env vars — docs/era18-p0-staging-proof-ops-checklist.md",
    },
    {
      id: "weekly_support_rhythm",
      label: "Weekly support + Integration Health review scheduled",
      status: "not_applicable",
      detail: "Calendar owner action — not machine-verified until pilot start",
    },
  ];
}

export function buildEra20PilotExecutionReadinessSlice(input: {
  metricsBaseline: PilotMetricsBaselineGoNoGoArtifact | null | undefined;
  rollbackDrill: PilotRollbackDrillGoNoGoArtifact | null | undefined;
  goNoGoArtifactPresent: boolean;
  forbiddenClaimsPassed: boolean;
  p0ProofPassed: boolean;
}): Era20PilotExecutionReadinessSlice {
  const metricsGate = derivePilotMetricsBaselineGate(input.metricsBaseline);
  const rollbackGate = derivePilotRollbackDrillGate(input.rollbackDrill);
  const supportChecklist = buildEra20PilotSupportChecklist({
    goNoGoArtifactPresent: input.goNoGoArtifactPresent,
    forbiddenClaimsPassed: input.forbiddenClaimsPassed,
    metricsGatePass: metricsGate.pass,
    rollbackGatePass: rollbackGate.pass,
    p0ProofPassed: input.p0ProofPassed,
  });
  const countable = supportChecklist.filter((row) => row.status !== "not_applicable");
  const supportChecklistDoneCount = countable.filter((row) => row.status === "done").length;
  const supportChecklistTotal = countable.length;

  let headline = "Pilot execution readiness — support and rollback gates visible before kickoff.";
  if (!rollbackGate.pass) {
    headline = "Rollback drill incomplete — run tabletop drill before paid pilot traffic.";
  } else if (!metricsGate.pass) {
    headline =
      "Rollback drill passed — capture metrics baseline at Week 1 (SKIPPED pre-kickoff is expected).";
  } else if (supportChecklistDoneCount === supportChecklistTotal) {
    headline = "Support checklist complete — sustain weekly reviews during pilot.";
  }

  return {
    policyId: ERA20_PILOT_EXECUTION_READINESS_POLICY_ID,
    headline,
    metricsGate,
    rollbackGate,
    supportChecklist,
    supportChecklistDoneCount,
    supportChecklistTotal,
    successMetricIds: ERA20_PILOT_SUCCESS_METRIC_IDS,
  };
}

export function buildPilotExecutionReadinessGoNoGoWarnings(
  slice: Era20PilotExecutionReadinessSlice,
): string[] {
  const warnings: string[] = [];
  if (!slice.metricsGate.pass) {
    warnings.push(
      `Pilot metrics baseline not captured — ${slice.metricsGate.reason} (warning only pre-kickoff; not a GO blocker)`,
    );
  }
  if (!slice.rollbackGate.pass) {
    warnings.push(
      `Pilot rollback drill incomplete — ${slice.rollbackGate.reason}`,
    );
  }
  return warnings;
}
