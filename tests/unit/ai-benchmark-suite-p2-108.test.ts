import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiBenchmarkSuiteP2_108,
  formatAiBenchmarkSuiteP2_108AuditLines,
} from "@/lib/ai/ai-benchmark-suite-p2-108-audit";
import { AI_BENCHMARK_SUITE_P2_108_BENCHMARKS } from "@/lib/ai/ai-benchmark-suite-p2-108-content";
import {
  computeMapePct,
  detectFoodCostAnomaly,
  FOOD_COST_ANOMALY_DEMO_FIXTURE,
  FORECAST_ACCURACY_DEMO_FIXTURE,
  LABOR_QUALITY_DEMO_FIXTURE,
  runAiBenchmarkSuiteP2_108,
  runFoodCostAnomalyBenchmarkP2_108,
  runForecastAccuracyBenchmarkP2_108,
  runInvoiceAccuracyBenchmarkP2_108,
  runLaborQualityBenchmarkP2_108,
  scoreFoodCostAnomalyRecall,
  scoreLaborQualityAverage,
} from "@/lib/ai/ai-benchmark-suite-p2-108-operations";
import {
  AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT,
  AI_BENCHMARK_SUITE_P2_108_CI_WORKFLOW,
  AI_BENCHMARK_SUITE_P2_108_DOC,
  AI_BENCHMARK_SUITE_P2_108_NPM_SCRIPT,
  AI_BENCHMARK_SUITE_P2_108_POLICY_ID,
  AI_BENCHMARK_SUITE_P2_108_ROUTE,
  AI_BENCHMARK_SUITE_P2_108_UNIT_TEST,
} from "@/lib/ai/ai-benchmark-suite-p2-108-policy";

const ROOT = process.cwd();

describe("AI benchmark suite (P2-108)", () => {
  it("locks policy id, route, and four benchmarks", () => {
    expect(AI_BENCHMARK_SUITE_P2_108_POLICY_ID).toBe("ai-benchmark-suite-p2-108-v1");
    expect(AI_BENCHMARK_SUITE_P2_108_ROUTE).toBe("/dashboard/ai/benchmark-suite");
    expect(AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT).toBe(4);
    expect(AI_BENCHMARK_SUITE_P2_108_BENCHMARKS).toHaveLength(4);
  });

  it("passes full AI benchmark suite audit", () => {
    const summary = auditAiBenchmarkSuiteP2_108(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.runScriptWired).toBe(true);
    expect(summary.legacyInvoiceLinked).toBe(true);
    expect(summary.legacyForecastLinked).toBe(true);
    expect(summary.legacyFoodCostLinked).toBe(true);
    expect(summary.legacyLaborLinked).toBe(true);
    expect(summary.benchmarkCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("runs invoice accuracy benchmark above threshold", () => {
    const result = runInvoiceAccuracyBenchmarkP2_108();
    expect(result.id).toBe("invoice-accuracy");
    expect(result.sampleCount).toBeGreaterThanOrEqual(50);
    expect(result.passed).toBe(true);
    expect(result.scorePct).toBeGreaterThanOrEqual(85);
  });

  it("computes forecast MAPE on demo fixture", () => {
    const mape = computeMapePct(
      [...FORECAST_ACCURACY_DEMO_FIXTURE.actual],
      [...FORECAST_ACCURACY_DEMO_FIXTURE.forecast],
    );
    expect(mape).toBeGreaterThan(0);
    expect(mape).toBeLessThan(20);
    const result = runForecastAccuracyBenchmarkP2_108();
    expect(result.passed).toBe(true);
  });

  it("detects food cost anomalies with high recall", () => {
    expect(detectFoodCostAnomaly({ theoreticalPct: 28, actualPct: 58 })).toBe(true);
    expect(detectFoodCostAnomaly({ theoreticalPct: 32, actualPct: 34 })).toBe(false);
    const recall = scoreFoodCostAnomalyRecall(FOOD_COST_ANOMALY_DEMO_FIXTURE);
    expect(recall).toBeGreaterThanOrEqual(80);
    expect(runFoodCostAnomalyBenchmarkP2_108().passed).toBe(true);
  });

  it("scores labor quality above threshold", () => {
    const quality = scoreLaborQualityAverage(LABOR_QUALITY_DEMO_FIXTURE);
    expect(quality).toBeGreaterThanOrEqual(75);
    expect(runLaborQualityBenchmarkP2_108().passed).toBe(true);
  });

  it("runs full suite with all benchmarks passing", () => {
    const report = runAiBenchmarkSuiteP2_108();
    expect(report.benchmarkCount).toBe(4);
    expect(report.passedCount).toBe(4);
    expect(report.failedCount).toBe(0);
    expect(report.passed).toBe(true);
    expect(report.benchmarks.map((b) => b.id)).toEqual([
      "invoice-accuracy",
      "forecast-accuracy",
      "food-cost-anomaly",
      "labor-quality",
    ]);
  });

  it("wires CI audit script, benchmark runner, and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[AI_BENCHMARK_SUITE_P2_108_NPM_SCRIPT]).toContain(
      "audit-ai-benchmark-suite-p2-108.ts",
    );
    expect(pkg.scripts["test:ci:ai-benchmark-suite-p2-108"]).toContain(
      AI_BENCHMARK_SUITE_P2_108_UNIT_TEST,
    );
    expect(pkg.scripts["benchmark:ai-benchmark-suite-p2-108"]).toContain(
      "run-ai-benchmark-suite-p2-108.ts",
    );

    const workflow = readFileSync(join(ROOT, AI_BENCHMARK_SUITE_P2_108_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(AI_BENCHMARK_SUITE_P2_108_NPM_SCRIPT);

    expect(existsSync(join(ROOT, AI_BENCHMARK_SUITE_P2_108_DOC))).toBe(true);
    expect(existsSync(join(ROOT, "scripts/run-ai-benchmark-suite-p2-108.ts"))).toBe(true);
    expect(
      formatAiBenchmarkSuiteP2_108AuditLines(auditAiBenchmarkSuiteP2_108(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
