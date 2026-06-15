/**
 * Pure helpers for AI benchmark suite (Blueprint P2-108).
 */

import {
  AI_BENCHMARK_SUITE_P2_108_MAX_FORECAST_MAPE_PCT,
  AI_BENCHMARK_SUITE_P2_108_MIN_FOOD_COST_RECALL_PCT,
  AI_BENCHMARK_SUITE_P2_108_MIN_INVOICE_ACCURACY_PCT,
  AI_BENCHMARK_SUITE_P2_108_MIN_LABOR_QUALITY_PCT,
  AI_BENCHMARK_SUITE_P2_108_POLICY_ID,
} from "@/lib/ai/ai-benchmark-suite-p2-108-policy";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { runInvoiceScannerAccuracyBenchmark } from "@/lib/qa/invoice-scanner-accuracy-scoring";

export type AiBenchmarkId =
  | "invoice-accuracy"
  | "forecast-accuracy"
  | "food-cost-anomaly"
  | "labor-quality";

export type AiBenchmarkResult = {
  id: AiBenchmarkId;
  label: string;
  scorePct: number;
  thresholdLabel: string;
  passed: boolean;
  sampleCount: number;
  detail: string;
};

export type AiBenchmarkSuiteReport = {
  policyId: typeof AI_BENCHMARK_SUITE_P2_108_POLICY_ID;
  benchmarkCount: number;
  passedCount: number;
  failedCount: number;
  passed: boolean;
  benchmarks: AiBenchmarkResult[];
  runAt: string;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeMapePct(actual: number[], forecast: number[]): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const f = forecast[i];
    if (a === 0) continue;
    sum += Math.abs((a - f) / a);
    n++;
  }
  return n === 0 ? 0 : round1((sum / n) * 100);
}

export const FORECAST_ACCURACY_DEMO_FIXTURE = {
  actual: [120, 98, 145, 110, 132, 88, 156],
  forecast: [115, 102, 138, 118, 125, 92, 148],
} as const;

export const FOOD_COST_ANOMALY_DEMO_FIXTURE = [
  { productId: "fries", theoreticalPct: 28, actualPct: 58, isAnomaly: true },
  { productId: "burger", theoreticalPct: 32, actualPct: 34, isAnomaly: false },
  { productId: "salad", theoreticalPct: 22, actualPct: 24, isAnomaly: false },
  { productId: "pasta", theoreticalPct: 26, actualPct: 49, isAnomaly: true },
  { productId: "soup", theoreticalPct: 18, actualPct: 19, isAnomaly: false },
  { productId: "steak", theoreticalPct: 35, actualPct: 52, isAnomaly: true },
  { productId: "fish", theoreticalPct: 30, actualPct: 31, isAnomaly: false },
  { productId: "tacos", theoreticalPct: 24, actualPct: 41, isAnomaly: true },
] as const;

export const LABOR_QUALITY_DEMO_FIXTURE = [
  { shiftId: "mon-lunch", coveragePct: 92, overtimeRisk: false, alignmentPct: 88 },
  { shiftId: "mon-dinner", coveragePct: 85, overtimeRisk: true, alignmentPct: 72 },
  { shiftId: "tue-lunch", coveragePct: 95, overtimeRisk: false, alignmentPct: 91 },
  { shiftId: "tue-dinner", coveragePct: 78, overtimeRisk: true, alignmentPct: 68 },
  { shiftId: "wed-lunch", coveragePct: 90, overtimeRisk: false, alignmentPct: 86 },
  { shiftId: "wed-dinner", coveragePct: 88, overtimeRisk: false, alignmentPct: 84 },
] as const;

const ANOMALY_THRESHOLD_PCT = 10;

export function detectFoodCostAnomaly(input: {
  theoreticalPct: number;
  actualPct: number;
}): boolean {
  return input.actualPct - input.theoreticalPct >= ANOMALY_THRESHOLD_PCT;
}

export function scoreFoodCostAnomalyRecall(
  rows: ReadonlyArray<{ theoreticalPct: number; actualPct: number; isAnomaly: boolean }>,
): number {
  const trueAnomalies = rows.filter((row) => row.isAnomaly);
  if (trueAnomalies.length === 0) return 100;
  const detected = trueAnomalies.filter((row) =>
    detectFoodCostAnomaly({ theoreticalPct: row.theoreticalPct, actualPct: row.actualPct }),
  ).length;
  return Math.round((detected / trueAnomalies.length) * 100);
}

export function scoreLaborShiftQuality(input: {
  coveragePct: number;
  overtimeRisk: boolean;
  alignmentPct: number;
}): number {
  const overtimePenalty = input.overtimeRisk ? 15 : 0;
  const raw = (input.coveragePct * 0.4 + input.alignmentPct * 0.6) - overtimePenalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function scoreLaborQualityAverage(
  rows: ReadonlyArray<{
    coveragePct: number;
    overtimeRisk: boolean;
    alignmentPct: number;
  }>,
): number {
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, row) => sum + scoreLaborShiftQuality(row), 0);
  return Math.round(total / rows.length);
}

export function runInvoiceAccuracyBenchmarkP2_108(): AiBenchmarkResult {
  const corpus = buildInvoiceScannerAccuracyCorpus();
  const result = runInvoiceScannerAccuracyBenchmark(corpus);

  return {
    id: "invoice-accuracy",
    label: "Invoice accuracy",
    scorePct: result.overallAccuracyPct,
    thresholdLabel: `≥${AI_BENCHMARK_SUITE_P2_108_MIN_INVOICE_ACCURACY_PCT}%`,
    passed: result.overallAccuracyPct >= AI_BENCHMARK_SUITE_P2_108_MIN_INVOICE_ACCURACY_PCT,
    sampleCount: result.invoiceCount,
    detail: `Supplier ${result.supplierAccuracyPct}% · amount ${result.amountAccuracyPct}% · line-items ${result.lineItemAccuracyPct}%`,
  };
}

export function runForecastAccuracyBenchmarkP2_108(): AiBenchmarkResult {
  const mape = computeMapePct(
    [...FORECAST_ACCURACY_DEMO_FIXTURE.actual],
    [...FORECAST_ACCURACY_DEMO_FIXTURE.forecast],
  );
  const scorePct = Math.max(0, Math.round(100 - mape));

  return {
    id: "forecast-accuracy",
    label: "Forecast accuracy",
    scorePct,
    thresholdLabel: `MAPE ≤${AI_BENCHMARK_SUITE_P2_108_MAX_FORECAST_MAPE_PCT}%`,
    passed: mape <= AI_BENCHMARK_SUITE_P2_108_MAX_FORECAST_MAPE_PCT,
    sampleCount: FORECAST_ACCURACY_DEMO_FIXTURE.actual.length,
    detail: `MAPE ${mape}% on ${FORECAST_ACCURACY_DEMO_FIXTURE.actual.length}-day order forecast`,
  };
}

export function runFoodCostAnomalyBenchmarkP2_108(): AiBenchmarkResult {
  const recall = scoreFoodCostAnomalyRecall(FOOD_COST_ANOMALY_DEMO_FIXTURE);

  return {
    id: "food-cost-anomaly",
    label: "Food cost anomaly",
    scorePct: recall,
    thresholdLabel: `≥${AI_BENCHMARK_SUITE_P2_108_MIN_FOOD_COST_RECALL_PCT}% recall`,
    passed: recall >= AI_BENCHMARK_SUITE_P2_108_MIN_FOOD_COST_RECALL_PCT,
    sampleCount: FOOD_COST_ANOMALY_DEMO_FIXTURE.length,
    detail: `${recall}% recall on ${FOOD_COST_ANOMALY_DEMO_FIXTURE.filter((r) => r.isAnomaly).length} known anomalies`,
  };
}

export function runLaborQualityBenchmarkP2_108(): AiBenchmarkResult {
  const quality = scoreLaborQualityAverage(LABOR_QUALITY_DEMO_FIXTURE);

  return {
    id: "labor-quality",
    label: "Labor quality",
    scorePct: quality,
    thresholdLabel: `≥${AI_BENCHMARK_SUITE_P2_108_MIN_LABOR_QUALITY_PCT}%`,
    passed: quality >= AI_BENCHMARK_SUITE_P2_108_MIN_LABOR_QUALITY_PCT,
    sampleCount: LABOR_QUALITY_DEMO_FIXTURE.length,
    detail: `Avg shift quality ${quality}% across ${LABOR_QUALITY_DEMO_FIXTURE.length} shifts`,
  };
}

export function runAiBenchmarkSuiteP2_108(): AiBenchmarkSuiteReport {
  const benchmarks = [
    runInvoiceAccuracyBenchmarkP2_108(),
    runForecastAccuracyBenchmarkP2_108(),
    runFoodCostAnomalyBenchmarkP2_108(),
    runLaborQualityBenchmarkP2_108(),
  ];

  const passedCount = benchmarks.filter((b) => b.passed).length;

  return {
    policyId: AI_BENCHMARK_SUITE_P2_108_POLICY_ID,
    benchmarkCount: benchmarks.length,
    passedCount,
    failedCount: benchmarks.length - passedCount,
    passed: passedCount === benchmarks.length,
    benchmarks,
    runAt: new Date().toISOString(),
  };
}
