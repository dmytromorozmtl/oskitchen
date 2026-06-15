import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRICS } from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-content";
import {
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_HONESTY_MARKERS,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_LEGACY_POLICY,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_OPERATIONS_PATH,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_RUN_SCRIPT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_SERVICE_PATH,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_WIRING_PATHS,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-policy";
import { INVOICE_OCR_ACCURACY_CORPUS_P2_96_COUNT } from "@/lib/qa/invoice-scanner-accuracy-corpus";

export type InvoiceOcrAccuracyBenchmarkP2_96AuditSummary = {
  policyId: typeof INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  runScriptWired: boolean;
  legacyPolicyLinked: boolean;
  corpusCountCorrect: boolean;
  metricCountCorrect: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditInvoiceOcrAccuracyBenchmarkP2_96(
  root = process.cwd(),
): InvoiceOcrAccuracyBenchmarkP2_96AuditSummary {
  const wiringComplete = INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let runScriptWired = false;
  let legacyPolicyLinked = false;

  if (existsSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC))) {
    const source = readFileSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC), "utf8");
    docWired =
      source.includes(String(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES)) &&
      source.includes("supplier") &&
      source.includes("price variance");
  }

  if (existsSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("runInvoiceOcrAccuracyBenchmarkP2_96") &&
      source.includes("buildSupplierAccuracyBreakdown") &&
      source.includes("computePriceVarianceAccuracyPct");
  }

  if (existsSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_SERVICE_PATH))) {
    const source = readFileSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadInvoiceOcrAccuracyBenchmarkP2_96") &&
      source.includes("buildInvoiceOcrAccuracyCorpusP2_96") &&
      source.includes("runInvoiceOcrAccuracyBenchmarkP2_96");
  }

  if (existsSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_RUN_SCRIPT))) {
    const source = readFileSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_RUN_SCRIPT), "utf8");
    runScriptWired =
      source.includes("loadInvoiceOcrAccuracyBenchmarkP2_96") &&
      (source.includes(INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT) ||
        source.includes("INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT"));
  }

  if (existsSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_LEGACY_POLICY))) {
    const source = readFileSync(join(root, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_LEGACY_POLICY), "utf8");
    legacyPolicyLinked = source.includes("invoice-scanner-accuracy-benchmark-v1");
  }

  const corpusPath = "lib/qa/invoice-scanner-accuracy-corpus.ts";
  let corpusCountCorrect = false;
  if (existsSync(join(root, corpusPath))) {
    const source = readFileSync(join(root, corpusPath), "utf8");
    corpusCountCorrect =
      source.includes("buildInvoiceOcrAccuracyCorpusP2_96") &&
      source.includes(String(INVOICE_OCR_ACCURACY_CORPUS_P2_96_COUNT));
  }

  const metricCountCorrect =
    INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRICS.length ===
    INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT;

  const combinedSources = [
    INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC,
    "lib/ai/invoice-ocr-accuracy-benchmark-p2-96-content.ts",
    INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_OPERATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_HONESTY_MARKERS.every(
    (marker) => combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    operationsWired &&
    serviceWired &&
    runScriptWired &&
    legacyPolicyLinked &&
    corpusCountCorrect &&
    metricCountCorrect &&
    honestyMarkersPresent;

  return {
    policyId: INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID,
    wiringComplete,
    docWired,
    operationsWired,
    serviceWired,
    runScriptWired,
    legacyPolicyLinked,
    corpusCountCorrect,
    metricCountCorrect,
    honestyMarkersPresent,
    passed,
  };
}

export function formatInvoiceOcrAccuracyBenchmarkP2_96AuditLines(
  summary: InvoiceOcrAccuracyBenchmarkP2_96AuditSummary,
): string[] {
  return [
    `Invoice OCR accuracy benchmark audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Run script: ${summary.runScriptWired ? "yes" : "no"}`,
    `Legacy policy linked: ${summary.legacyPolicyLinked ? "yes" : "no"}`,
    `Corpus (${INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES} invoices): ${summary.corpusCountCorrect ? "yes" : "no"}`,
    `Metrics (${INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT}): ${summary.metricCountCorrect ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
