import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AI_BENCHMARK_SUITE_P2_108_BENCHMARKS } from "@/lib/ai/ai-benchmark-suite-p2-108-content";
import {
  AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT,
  AI_BENCHMARK_SUITE_P2_108_COMPONENT,
  AI_BENCHMARK_SUITE_P2_108_DOC,
  AI_BENCHMARK_SUITE_P2_108_HONESTY_MARKERS,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_FOOD_COST,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_FORECAST,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_INVOICE,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_LABOR,
  AI_BENCHMARK_SUITE_P2_108_OPERATIONS_PATH,
  AI_BENCHMARK_SUITE_P2_108_PAGE,
  AI_BENCHMARK_SUITE_P2_108_POLICY_ID,
  AI_BENCHMARK_SUITE_P2_108_ROUTE,
  AI_BENCHMARK_SUITE_P2_108_RUN_SCRIPT,
  AI_BENCHMARK_SUITE_P2_108_SERVICE_PATH,
  AI_BENCHMARK_SUITE_P2_108_WIRING_PATHS,
} from "@/lib/ai/ai-benchmark-suite-p2-108-policy";

export type AiBenchmarkSuiteP2_108AuditSummary = {
  policyId: typeof AI_BENCHMARK_SUITE_P2_108_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  runScriptWired: boolean;
  legacyInvoiceLinked: boolean;
  legacyForecastLinked: boolean;
  legacyFoodCostLinked: boolean;
  legacyLaborLinked: boolean;
  benchmarkCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAiBenchmarkSuiteP2_108(
  root = process.cwd(),
): AiBenchmarkSuiteP2_108AuditSummary {
  const wiringComplete = AI_BENCHMARK_SUITE_P2_108_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let runScriptWired = false;
  let legacyInvoiceLinked = false;
  let legacyForecastLinked = false;
  let legacyFoodCostLinked = false;
  let legacyLaborLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_DOC))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_DOC), "utf8");
    docWired =
      source.includes(AI_BENCHMARK_SUITE_P2_108_ROUTE) &&
      source.includes(String(AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT));
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_COMPONENT))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_COMPONENT), "utf8");
    componentWired =
      source.includes("AiBenchmarkSuitePanel") &&
      source.includes("AI_BENCHMARK_SUITE_P2_108_BENCHMARKS");
    allTestIdsPresent =
      source.includes("AI_BENCHMARK_SUITE_P2_108_TEST_IDS[0]") &&
      source.includes("AI_BENCHMARK_SUITE_P2_108_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_PAGE))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_PAGE), "utf8");
    pageWired =
      source.includes("AiBenchmarkSuitePanel") &&
      source.includes("AI_BENCHMARK_SUITE_P2_108_POLICY_ID");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("runInvoiceAccuracyBenchmarkP2_108") &&
      source.includes("runForecastAccuracyBenchmarkP2_108") &&
      source.includes("runFoodCostAnomalyBenchmarkP2_108") &&
      source.includes("runLaborQualityBenchmarkP2_108") &&
      source.includes("runAiBenchmarkSuiteP2_108");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_SERVICE_PATH))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadAiBenchmarkSuiteSnapshot") &&
      source.includes("AI_BENCHMARK_SUITE_P2_108_POLICY_ID");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_RUN_SCRIPT))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_RUN_SCRIPT), "utf8");
    runScriptWired =
      source.includes("runAiBenchmarkSuiteP2_108") &&
      source.includes("AI_BENCHMARK_SUITE_P2_108_ARTIFACT");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_INVOICE))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_INVOICE), "utf8");
    legacyInvoiceLinked = source.includes("runInvoiceScannerAccuracyBenchmark");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_FORECAST))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_FORECAST), "utf8");
    legacyForecastLinked = source.includes("mape");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_FOOD_COST))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_FOOD_COST), "utf8");
    legacyFoodCostLinked = source.includes("buildActualVsTheoreticalVarianceReport");
  }

  if (existsSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_LABOR))) {
    const source = readFileSync(join(root, AI_BENCHMARK_SUITE_P2_108_LEGACY_LABOR), "utf8");
    legacyLaborLinked = source.includes("loadLaborManagerSnapshot");
  }

  const combinedSources = [
    AI_BENCHMARK_SUITE_P2_108_DOC,
    "lib/ai/ai-benchmark-suite-p2-108-content.ts",
    AI_BENCHMARK_SUITE_P2_108_OPERATIONS_PATH,
    AI_BENCHMARK_SUITE_P2_108_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = AI_BENCHMARK_SUITE_P2_108_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const benchmarkCountCorrect =
    AI_BENCHMARK_SUITE_P2_108_BENCHMARKS.length === AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    runScriptWired &&
    legacyInvoiceLinked &&
    legacyForecastLinked &&
    legacyFoodCostLinked &&
    legacyLaborLinked &&
    benchmarkCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: AI_BENCHMARK_SUITE_P2_108_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    runScriptWired,
    legacyInvoiceLinked,
    legacyForecastLinked,
    legacyFoodCostLinked,
    legacyLaborLinked,
    benchmarkCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAiBenchmarkSuiteP2_108AuditLines(
  summary: AiBenchmarkSuiteP2_108AuditSummary,
): string[] {
  return [
    `AI benchmark suite audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${AI_BENCHMARK_SUITE_P2_108_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${AI_BENCHMARK_SUITE_P2_108_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Run script: ${summary.runScriptWired ? "yes" : "no"}`,
    `Legacy invoice linked: ${summary.legacyInvoiceLinked ? "yes" : "no"}`,
    `Legacy forecast linked: ${summary.legacyForecastLinked ? "yes" : "no"}`,
    `Legacy food cost linked: ${summary.legacyFoodCostLinked ? "yes" : "no"}`,
    `Legacy labor linked: ${summary.legacyLaborLinked ? "yes" : "no"}`,
    `Benchmarks (${AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT}): ${summary.benchmarkCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
