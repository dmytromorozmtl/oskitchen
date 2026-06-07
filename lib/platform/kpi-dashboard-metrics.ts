import { calculatePortfolioNps } from "@/lib/marketing/referral-program-policy";

import type { KpiDashboardMetricId } from "@/lib/platform/kpi-dashboard-absolute-final-policy";

export type KpiMetricStatus = "live" | "partial" | "awaiting_data";

export type KpiMetricSnapshot = {
  id: KpiDashboardMetricId;
  label: string;
  display: string;
  raw: number | null;
  unit: string;
  status: KpiMetricStatus;
  hint: string;
  source: string;
};

const NPS_TITLE_RE = /^NPS (\d{1,2})\/10$/;

export function parseNpsScoreFromTitle(title: string): number | null {
  const match = NPS_TITLE_RE.exec(title.trim());
  if (!match) return null;
  const score = Number(match[1]);
  if (!Number.isFinite(score) || score < 0 || score > 10) return null;
  return score;
}

export function summarizeNpsFromScores(scores: number[]): {
  nps: number | null;
  promoters: number;
  detractors: number;
  total: number;
} {
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  const total = scores.length;
  return {
    nps: calculatePortfolioNps(promoters, detractors, total),
    promoters,
    detractors,
    total,
  };
}

export function formatUsd(cents: number | null): string {
  if (cents === null) return "—";
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatHours(value: number | null): string {
  if (value === null) return "—";
  if (value < 48) return `${Math.round(value)}h`;
  return `${(value / 24).toFixed(1)}d`;
}

export function formatCount(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString();
}

export function computeMedianHours(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

export function computeErrorRatePct(errorSignals7d: number, orders7d: number): number | null {
  if (orders7d <= 0 && errorSignals7d <= 0) return 0;
  const denominator = Math.max(orders7d, 1);
  return Math.round((errorSignals7d / denominator) * 1000) / 10;
}

export function computePlatformUptimePct(input: {
  databaseOk: boolean;
  cronOk: boolean;
  integrationErrorRate: number;
}): number {
  const weights: number[] = [input.databaseOk ? 100 : 0];
  weights.push(input.cronOk ? 100 : 85);
  const integrationPct = Math.max(0, 100 - input.integrationErrorRate * 100);
  weights.push(integrationPct);
  return Math.round((weights.reduce((sum, v) => sum + v, 0) / weights.length) * 10) / 10;
}

export function sumObservabilityErrors(counts: {
  webhookProcessingErrors7d: number;
  channelSyncFailed: number;
  notificationFailures7d: number;
  importJobsFailed: number;
  channelImportBatchesFailed: number;
  exportJobsFailed: number;
  automationExecutionsFailed7d: number;
  auditExportsFailed7d: number;
  openWebhookJobRecoveries: number;
}): number {
  return (
    counts.webhookProcessingErrors7d +
    counts.channelSyncFailed +
    counts.notificationFailures7d +
    counts.importJobsFailed +
    counts.channelImportBatchesFailed +
    counts.exportJobsFailed +
    counts.automationExecutionsFailed7d +
    counts.auditExportsFailed7d +
    counts.openWebhookJobRecoveries
  );
}
