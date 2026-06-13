import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_AUDIT_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_FLOW_STEPS,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_HONESTY_MARKERS,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_NPM_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_RUN_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_SCORING,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_WIRING_PATHS,
} from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-policy";
import {
  buildInvoiceAiAccuracyBenchmarkCorpusP2_44,
  runInvoiceAiAccuracyBenchmarkP2_44,
} from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-scoring";

export type InvoiceAiAccuracyBenchmarkP2_44AuditSummary = {
  policyId: typeof INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  runScriptPresent: boolean;
  scoringWired: boolean;
  corpusCount: number;
  invoiceCount: number;
  thresholdPct: number;
  goldenPassed: boolean;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
  overallAccuracyPct: number;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditInvoiceAiAccuracyBenchmarkP2_44(
  root = process.cwd(),
): InvoiceAiAccuracyBenchmarkP2_44AuditSummary {
  const wiringComplete = INVOICE_AI_ACCURACY_BENCHMARK_P2_44_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC))) {
    const source = readFileSync(join(root, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC), "utf8");
    docWired =
      source.includes("95%") &&
      source.includes("50 invoice") &&
      source.includes("golden corpus");
  }

  const runScriptPresent = existsSync(join(root, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_RUN_SCRIPT));

  let scoringWired = false;
  if (existsSync(join(root, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_SCORING))) {
    const source = readFileSync(join(root, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_SCORING), "utf8");
    scoringWired =
      source.includes("runInvoiceAiAccuracyBenchmarkP2_44") &&
      source.includes("INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT");
  }

  const unitTestReferencesPolicy =
    existsSync(join(root, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST)) &&
    readFileSync(join(root, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST), "utf8").includes(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID,
    );

  const fixtures = buildInvoiceAiAccuracyBenchmarkCorpusP2_44();
  const result = runInvoiceAiAccuracyBenchmarkP2_44(fixtures);

  const combined = [INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = INVOICE_AI_ACCURACY_BENCHMARK_P2_44_HONESTY_MARKERS.every(
    (marker) => combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    runScriptPresent &&
    scoringWired &&
    unitTestReferencesPolicy &&
    fixtures.length === INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT &&
    result.passed &&
    result.overallAccuracyPct >= INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT &&
    honestyMarkersPresent &&
    INVOICE_AI_ACCURACY_BENCHMARK_P2_44_FLOW_STEPS.length === 3;

  return {
    policyId: INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID,
    wiringComplete,
    docWired,
    runScriptPresent,
    scoringWired,
    corpusCount: fixtures.length,
    invoiceCount: INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT,
    thresholdPct: INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
    goldenPassed: result.passed,
    supplierAccuracyPct: result.supplierAccuracyPct,
    amountAccuracyPct: result.amountAccuracyPct,
    lineItemAccuracyPct: result.lineItemAccuracyPct,
    overallAccuracyPct: result.overallAccuracyPct,
    honestyMarkersPresent,
    passed,
  };
}

export function formatInvoiceAiAccuracyBenchmarkP2_44AuditLines(
  summary: InvoiceAiAccuracyBenchmarkP2_44AuditSummary,
): string[] {
  return [
    `Invoice AI accuracy benchmark audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC})`,
    `Run script: ${summary.runScriptPresent ? "present" : "missing"} (${INVOICE_AI_ACCURACY_BENCHMARK_P2_44_RUN_SCRIPT})`,
    `Scoring wired: ${summary.scoringWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusCount} invoices (exactly ${summary.invoiceCount})`,
    `Threshold: ${summary.thresholdPct}% (accuracy <${summary.thresholdPct}% = fail)`,
    `Supplier accuracy: ${summary.supplierAccuracyPct}%`,
    `Amount accuracy: ${summary.amountAccuracyPct}%`,
    `Line-item accuracy: ${summary.lineItemAccuracyPct}%`,
    `Overall accuracy: ${summary.overallAccuracyPct}%`,
    `Golden corpus: ${summary.goldenPassed ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Unit test: ${INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST}`,
    `Audit script: ${INVOICE_AI_ACCURACY_BENCHMARK_P2_44_AUDIT_SCRIPT}`,
    `NPM script: ${INVOICE_AI_ACCURACY_BENCHMARK_P2_44_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
