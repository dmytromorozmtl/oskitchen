import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PILOT_SUCCESS_METRICS_MILESTONES,
  PILOT_SUCCESS_METRICS_POLICY_ID,
} from "@/lib/pm/pilot-success-metrics-p3-131-policy";

export type PilotSuccessMetricRecord = {
  id: string;
  target: string;
  status: "not_captured" | "pass" | "fail" | "partial";
  value: string | null;
  note: string;
};

export type PilotSuccessMetricsMilestoneRecord = {
  id: string;
  week: number;
  label: string;
  metrics: PilotSuccessMetricRecord[];
};

export type PilotSuccessMetricsBaseline = {
  version: string;
  policyId: typeof PILOT_SUCCESS_METRICS_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  pilotCustomer: string | null;
  milestones: PilotSuccessMetricsMilestoneRecord[];
};

export function loadPilotSuccessMetricsBaseline(
  root = process.cwd(),
  artifactPath = "artifacts/pilot-success-metrics-baseline.json",
): PilotSuccessMetricsBaseline {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as PilotSuccessMetricsBaseline;
}

export function validatePilotSuccessMetricsBaseline(
  baseline: PilotSuccessMetricsBaseline,
): {
  valid: boolean;
  policyIdMatches: boolean;
  milestonesMatch: boolean;
  metricsComplete: boolean;
  allNotCaptured: boolean;
} {
  const policyIdMatches = baseline.policyId === PILOT_SUCCESS_METRICS_POLICY_ID;

  const milestonesMatch =
    baseline.milestones.length === PILOT_SUCCESS_METRICS_MILESTONES.length &&
    PILOT_SUCCESS_METRICS_MILESTONES.every(
      (expected, index) => baseline.milestones[index]?.id === expected.id,
    );

  const metricsComplete = PILOT_SUCCESS_METRICS_MILESTONES.every((expectedMilestone, index) => {
    const milestone = baseline.milestones[index];
    if (!milestone) {
      return false;
    }
    return (
      milestone.metrics.length === expectedMilestone.metrics.length &&
      expectedMilestone.metrics.every(
        (expectedMetric, metricIndex) =>
          milestone.metrics[metricIndex]?.id === expectedMetric.id &&
          milestone.metrics[metricIndex]?.target === expectedMetric.target,
      )
    );
  });

  const allNotCaptured =
    baseline.pilotCustomer === null &&
    baseline.milestones.every((milestone) =>
      milestone.metrics.every((metric) => metric.status === "not_captured"),
    );

  const valid = policyIdMatches && milestonesMatch && metricsComplete;

  return {
    valid,
    policyIdMatches,
    milestonesMatch,
    metricsComplete,
    allNotCaptured,
  };
}

export function countPilotSuccessMetrics(baseline: PilotSuccessMetricsBaseline): {
  milestoneCount: number;
  metricCount: number;
  capturedCount: number;
} {
  const metricCount = baseline.milestones.reduce(
    (sum, milestone) => sum + milestone.metrics.length,
    0,
  );
  const capturedCount = baseline.milestones.reduce(
    (sum, milestone) =>
      sum + milestone.metrics.filter((metric) => metric.status !== "not_captured").length,
    0,
  );

  return {
    milestoneCount: baseline.milestones.length,
    metricCount,
    capturedCount,
  };
}
