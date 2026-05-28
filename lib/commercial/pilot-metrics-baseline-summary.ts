/**
 * Pilot metrics baseline summary — Evolution Era 17 Cycle 19.
 */

import {
  PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS,
  PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
} from "@/lib/commercial/pilot-metrics-baseline-era17-policy";

export const PILOT_METRICS_BASELINE_SUMMARY_VERSION = "era17-pilot-metrics-baseline-v1" as const;

export type PilotMetricCaptureStatus = "captured" | "missing";

export type PilotMetricSnapshotValue = {
  id: string;
  label: string;
  status: PilotMetricCaptureStatus;
  value: string | number | null;
  unit: string;
  reason?: string;
};

export type PilotBaselineProofStatus =
  | "proof_captured"
  | "proof_skipped_missing_pilot_data"
  | "proof_partial";

export type PilotMetricsBaselineSummary = {
  version: typeof PILOT_METRICS_BASELINE_SUMMARY_VERSION;
  policyId: typeof PILOT_METRICS_BASELINE_ERA17_POLICY_ID;
  runAt: string;
  baselineProofStatus: PilotBaselineProofStatus;
  pilotWeek: number | null;
  customerRef: string | null;
  capturedAt: string | null;
  metrics: PilotMetricSnapshotValue[];
  capturedCount: number;
  missingCount: number;
};

export type PilotMetricsSnapshotInput = {
  ordersPerDay?: number | string | null;
  storefrontCheckoutSuccessRate?: number | string | null;
  posCheckoutStatus?: string | null;
  kdsBumpRate?: number | string | null;
  supportTicketsPerWeek?: number | string | null;
  operatorFeedbackScore?: number | string | null;
};

const METRIC_INPUT_KEYS: Record<
  (typeof PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS)[number]["id"],
  keyof PilotMetricsSnapshotInput
> = {
  orders_per_day: "ordersPerDay",
  storefront_checkout_success_rate: "storefrontCheckoutSuccessRate",
  pos_checkout_completion: "posCheckoutStatus",
  kds_bump_rate: "kdsBumpRate",
  support_tickets_per_week: "supportTicketsPerWeek",
  operator_feedback_score: "operatorFeedbackScore",
};

export function parsePilotMetricsSnapshotJson(
  raw: string | undefined,
): PilotMetricsSnapshotInput {
  if (!raw?.trim()) return {};
  try {
    return JSON.parse(raw) as PilotMetricsSnapshotInput;
  } catch {
    return {};
  }
}

function readEnvValue(envKey: string): string | undefined {
  return process.env[envKey]?.trim() || undefined;
}

function normalizeMetricValue(
  raw: string | number | null | undefined,
): string | number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const text = String(raw).trim();
  return text.length > 0 ? text : null;
}

export function buildPilotMetricsSnapshotFromEnv(
  jsonInput: PilotMetricsSnapshotInput = {},
): PilotMetricsSnapshotInput {
  return {
    ordersPerDay:
      jsonInput.ordersPerDay ?? readEnvValue("PILOT_METRICS_ORDERS_PER_DAY") ?? null,
    storefrontCheckoutSuccessRate:
      jsonInput.storefrontCheckoutSuccessRate ??
      readEnvValue("PILOT_METRICS_STOREFRONT_CHECKOUT_SUCCESS_RATE") ??
      null,
    posCheckoutStatus:
      jsonInput.posCheckoutStatus ?? readEnvValue("PILOT_METRICS_POS_CHECKOUT_STATUS") ?? null,
    kdsBumpRate:
      jsonInput.kdsBumpRate ?? readEnvValue("PILOT_METRICS_KDS_BUMP_RATE") ?? null,
    supportTicketsPerWeek:
      jsonInput.supportTicketsPerWeek ??
      readEnvValue("PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK") ??
      null,
    operatorFeedbackScore:
      jsonInput.operatorFeedbackScore ??
      readEnvValue("PILOT_METRICS_OPERATOR_FEEDBACK_SCORE") ??
      null,
  };
}

export function buildPilotMetricSnapshotValues(
  input: PilotMetricsSnapshotInput,
): PilotMetricSnapshotValue[] {
  return PILOT_METRICS_BASELINE_ERA17_METRIC_DEFINITIONS.map((definition) => {
    const inputKey = METRIC_INPUT_KEYS[definition.id];
    const value = normalizeMetricValue(input[inputKey]);
    if (value === null) {
      return {
        id: definition.id,
        label: definition.label,
        status: "missing",
        value: null,
        unit: definition.unit,
        reason: `Set ${definition.envKey} or include in PILOT_METRICS_SNAPSHOT_JSON`,
      };
    }
    return {
      id: definition.id,
      label: definition.label,
      status: "captured",
      value,
      unit: definition.unit,
    };
  });
}

export function resolvePilotBaselineProofStatus(
  metrics: readonly PilotMetricSnapshotValue[],
): PilotBaselineProofStatus {
  const captured = metrics.filter((metric) => metric.status === "captured").length;
  if (captured === 0) return "proof_skipped_missing_pilot_data";
  if (captured === metrics.length) return "proof_captured";
  return "proof_partial";
}

export function buildPilotMetricsBaselineSummary(
  input: PilotMetricsSnapshotInput,
  meta?: {
    pilotWeek?: number | null;
    customerRef?: string | null;
    capturedAt?: string | null;
  },
  runAt: Date = new Date(),
): PilotMetricsBaselineSummary {
  const metrics = buildPilotMetricSnapshotValues(input);
  const capturedCount = metrics.filter((metric) => metric.status === "captured").length;
  return {
    version: PILOT_METRICS_BASELINE_SUMMARY_VERSION,
    policyId: PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
    runAt: runAt.toISOString(),
    baselineProofStatus: resolvePilotBaselineProofStatus(metrics),
    pilotWeek: meta?.pilotWeek ?? null,
    customerRef: meta?.customerRef?.trim() || null,
    capturedAt: meta?.capturedAt?.trim() || null,
    metrics,
    capturedCount,
    missingCount: metrics.length - capturedCount,
  };
}

export function formatPilotMetricsBaselineReportLines(
  summary: PilotMetricsBaselineSummary,
): string[] {
  return [
    `Pilot metrics baseline (${summary.version}) — proof: ${summary.baselineProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Pilot week: ${summary.pilotWeek ?? "not recorded"}`,
    `Customer ref: ${summary.customerRef ?? "not recorded"}`,
    `Captured: ${summary.capturedCount}/${summary.metrics.length}`,
    "",
    ...summary.metrics.map((metric) =>
      metric.status === "captured"
        ? `[CAPTURED] ${metric.label}: ${metric.value} ${metric.unit}`
        : `[SKIPPED WITH REASON] ${metric.label}: ${metric.reason ?? "missing"}`,
    ),
  ];
}
