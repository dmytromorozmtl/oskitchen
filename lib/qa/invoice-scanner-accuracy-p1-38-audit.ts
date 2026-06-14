import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildInvoiceScannerAccuracyCorpusP138,
  runInvoiceScannerAccuracyP138,
} from "@/lib/qa/invoice-scanner-accuracy-p1-38-scoring";
import {
  INVOICE_SCANNER_ACCURACY_P1_38_ARTIFACT,
  INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT,
  INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID,
} from "@/lib/qa/invoice-scanner-accuracy-p1-38-policy";

export type InvoiceScannerAccuracyP138AuditSummary = {
  policyId: typeof INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID;
  invoiceCount: number;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  fieldAccuracyPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditInvoiceScannerAccuracyP138(
  root = process.cwd(),
): InvoiceScannerAccuracyP138AuditSummary {
  const corpus = buildInvoiceScannerAccuracyCorpusP138();
  const result = runInvoiceScannerAccuracyP138(corpus);
  const artifactPresent = existsSync(join(root, INVOICE_SCANNER_ACCURACY_P1_38_ARTIFACT));

  const passed =
    corpus.length === INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID,
    invoiceCount: corpus.length,
    corpusLoaded: corpus.length === INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT,
    scoringPassed: result.passed,
    fieldAccuracyPct: result.fieldAccuracyPct,
    artifactPresent,
    passed,
  };
}

export function formatInvoiceScannerAccuracyP138AuditLines(
  summary: InvoiceScannerAccuracyP138AuditSummary,
): string[] {
  return [
    `Invoice scanner accuracy (P1-38) audit (${summary.policyId})`,
    `Corpus: ${summary.invoiceCount} invoices`,
    `Field accuracy: ${summary.fieldAccuracyPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

export function readInvoiceScannerAccuracyP138Artifact(root = process.cwd()): {
  policyId: string;
  invoiceCount: number;
  fieldAccuracyPct: number;
} | null {
  const path = join(root, INVOICE_SCANNER_ACCURACY_P1_38_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    policyId: string;
    invoiceCount: number;
    fieldAccuracyPct: number;
  };
}
