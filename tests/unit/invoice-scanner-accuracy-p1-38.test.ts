import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditInvoiceScannerAccuracyP138,
  formatInvoiceScannerAccuracyP138AuditLines,
  readInvoiceScannerAccuracyP138Artifact,
} from "@/lib/qa/invoice-scanner-accuracy-p1-38-audit";
import {
  INVOICE_SCANNER_ACCURACY_P1_38_ARTIFACT,
  INVOICE_SCANNER_ACCURACY_P1_38_CHECK_NPM_SCRIPT,
  INVOICE_SCANNER_ACCURACY_P1_38_CI_NPM_SCRIPT,
  INVOICE_SCANNER_ACCURACY_P1_38_CI_WORKFLOW,
  INVOICE_SCANNER_ACCURACY_P1_38_DOC,
  INVOICE_SCANNER_ACCURACY_P1_38_FLOW_STEPS,
  INVOICE_SCANNER_ACCURACY_P1_38_HEADER_FIELDS,
  INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT,
  INVOICE_SCANNER_ACCURACY_P1_38_LINE_FIELDS,
  INVOICE_SCANNER_ACCURACY_P1_38_MIN_FIELD_PCT,
  INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID,
  INVOICE_SCANNER_ACCURACY_P1_38_WIRING_PATHS,
  isInvoiceScannerAccuracyP138Pass,
} from "@/lib/qa/invoice-scanner-accuracy-p1-38-policy";
import {
  buildDegradedInvoiceAccuracyP138Fixtures,
  buildInvoiceScannerAccuracyCorpusP138,
  runInvoiceScannerAccuracyP138,
  scoreInvoiceOcrFieldLevel,
} from "@/lib/qa/invoice-scanner-accuracy-p1-38-scoring";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("AI invoice scanner accuracy — 100 invoices (P1-38)", () => {
  it("locks P1-38 policy, 100 invoices, and field-level scoring", () => {
    expect(INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID).toBe("invoice-scanner-accuracy-p1-38-v1");
    expect(INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT).toBe(100);
    expect(INVOICE_SCANNER_ACCURACY_P1_38_MIN_FIELD_PCT).toBe(85);
    expect(INVOICE_SCANNER_ACCURACY_P1_38_HEADER_FIELDS).toHaveLength(6);
    expect(INVOICE_SCANNER_ACCURACY_P1_38_LINE_FIELDS).toHaveLength(4);
    expect(INVOICE_SCANNER_ACCURACY_P1_38_FLOW_STEPS).toEqual([
      "load_corpus_100",
      "score_field_level",
      "assert_accuracy_threshold",
    ]);
  });

  it("scores field-level match for a single golden fixture", () => {
    const [fixture] = buildInvoiceScannerAccuracyCorpusP138();
    const score = scoreInvoiceOcrFieldLevel(fixture!.predicted, fixture!.groundTruth);
    expect(score.supplierName).toBe(true);
    expect(score.invoiceNumber).toBe(true);
    expect(score.totalAmount).toBe(true);
    expect(score.fieldAccuracyPct).toBe(100);
  });

  it("passes 100-invoice golden corpus at 100% field accuracy", () => {
    const fixtures = buildInvoiceScannerAccuracyCorpusP138();
    expect(fixtures.length).toBe(100);

    const result = runInvoiceScannerAccuracyP138(fixtures);
    expect(result.fieldAccuracyPct).toBe(100);
    expect(result.fieldSummary.supplierNamePct).toBe(100);
    expect(result.fieldSummary.totalAmountPct).toBe(100);
    expect(result.fieldSummary.lineDescriptionPct).toBe(100);
    expect(result.passed).toBe(true);
    expect(isInvoiceScannerAccuracyP138Pass(result.fieldAccuracyPct)).toBe(true);
  });

  it("fails when degraded fixtures drop below 85% threshold", () => {
    const fixtures = buildDegradedInvoiceAccuracyP138Fixtures(
      buildInvoiceScannerAccuracyCorpusP138(),
      50,
    );
    const result = runInvoiceScannerAccuracyP138(fixtures);
    expect(result.passed).toBe(false);
    expect(result.fieldAccuracyPct).toBeLessThan(INVOICE_SCANNER_ACCURACY_P1_38_MIN_FIELD_PCT);
  });

  it("passes full P1-38 audit — corpus, scoring, artifact wired", () => {
    const summary = auditInvoiceScannerAccuracyP138(ROOT);
    expect(summary.corpusLoaded).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P1-38 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of INVOICE_SCANNER_ACCURACY_P1_38_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${INVOICE_SCANNER_ACCURACY_P1_38_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${INVOICE_SCANNER_ACCURACY_P1_38_CI_NPM_SCRIPT}"`);

    const ci = readSource(INVOICE_SCANNER_ACCURACY_P1_38_CI_WORKFLOW);
    expect(ci).toContain(INVOICE_SCANNER_ACCURACY_P1_38_CHECK_NPM_SCRIPT);

    const doc = readSource(INVOICE_SCANNER_ACCURACY_P1_38_DOC);
    expect(doc).toContain(INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID);

    const artifact = readInvoiceScannerAccuracyP138Artifact(ROOT);
    expect(artifact?.policyId).toBe(INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID);
    expect(artifact?.invoiceCount).toBe(100);

    expect(existsSync(join(ROOT, INVOICE_SCANNER_ACCURACY_P1_38_ARTIFACT))).toBe(true);
  });

  it("formats audit lines", () => {
    const summary = auditInvoiceScannerAccuracyP138(ROOT);
    const lines = formatInvoiceScannerAccuracyP138AuditLines(summary);
    expect(lines.some((line) => line.includes(INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
