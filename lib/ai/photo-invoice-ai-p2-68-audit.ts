import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildPhotoInvoiceAiCorpusP268 } from "@/lib/ai/photo-invoice-ai-p2-68-corpus";
import {
  PHOTO_INVOICE_AI_P2_68_ACTION,
  PHOTO_INVOICE_AI_P2_68_ARTIFACT,
  PHOTO_INVOICE_AI_P2_68_BUILDER,
  PHOTO_INVOICE_AI_P2_68_CAMERA_TEST_ID,
  PHOTO_INVOICE_AI_P2_68_DOC,
  PHOTO_INVOICE_AI_P2_68_PAGE,
  PHOTO_INVOICE_AI_P2_68_PANEL,
  PHOTO_INVOICE_AI_P2_68_PANEL_TEST_ID,
  PHOTO_INVOICE_AI_P2_68_POLICY_ID,
  PHOTO_INVOICE_AI_P2_68_POSTER_POS_PARITY_NOTE,
  PHOTO_INVOICE_AI_P2_68_SCANNER_SERVICE,
  PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT,
  PHOTO_INVOICE_AI_P2_68_SERVICE,
  PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_TEST_ID,
  PHOTO_INVOICE_AI_P2_68_WIRING_PATHS,
} from "@/lib/ai/photo-invoice-ai-p2-68-policy";
import { runPhotoInvoiceAiBenchmarkP268 } from "@/lib/ai/photo-invoice-ai-p2-68-scoring";

export type PhotoInvoiceAiP268AuditSummary = {
  policyId: typeof PHOTO_INVOICE_AI_P2_68_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  builderWired: boolean;
  scannerServiceWired: boolean;
  actionWired: boolean;
  panelWired: boolean;
  pageWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  capabilityCoveragePct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditPhotoInvoiceAiP268(root = process.cwd()): PhotoInvoiceAiP268AuditSummary {
  const wiringComplete = PHOTO_INVOICE_AI_P2_68_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PHOTO_INVOICE_AI_P2_68_DOC))) {
    const source = readFileSync(join(root, PHOTO_INVOICE_AI_P2_68_DOC), "utf8");
    docWired =
      source.includes(PHOTO_INVOICE_AI_P2_68_POLICY_ID) &&
      source.includes("Poster POS") &&
      source.includes(String(PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT));
  }

  let builderWired = false;
  if (existsSync(join(root, PHOTO_INVOICE_AI_P2_68_BUILDER))) {
    const source = readFileSync(join(root, PHOTO_INVOICE_AI_P2_68_BUILDER), "utf8");
    builderWired =
      source.includes("buildSupplierDocumentFromScannedInvoice") &&
      source.includes("isSupplierDocumentReadyForCreation");
  }

  let scannerServiceWired = false;
  if (existsSync(join(root, PHOTO_INVOICE_AI_P2_68_SCANNER_SERVICE))) {
    const source = readFileSync(join(root, PHOTO_INVOICE_AI_P2_68_SCANNER_SERVICE), "utf8");
    scannerServiceWired =
      source.includes("createSupplierDocumentFromReceipt") &&
      source.includes('status: "PENDING"');
  }

  let actionWired = false;
  if (existsSync(join(root, PHOTO_INVOICE_AI_P2_68_ACTION))) {
    const source = readFileSync(join(root, PHOTO_INVOICE_AI_P2_68_ACTION), "utf8");
    actionWired =
      source.includes("confirmPhotoInvoiceSupplierDocumentAction") &&
      source.includes("createSupplierDocumentFromReceipt");
  }

  let panelWired = false;
  if (existsSync(join(root, PHOTO_INVOICE_AI_P2_68_PANEL))) {
    const source = readFileSync(join(root, PHOTO_INVOICE_AI_P2_68_PANEL), "utf8");
    panelWired =
      source.includes(PHOTO_INVOICE_AI_P2_68_PANEL_TEST_ID) &&
      source.includes(PHOTO_INVOICE_AI_P2_68_CAMERA_TEST_ID) &&
      source.includes(PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_TEST_ID) &&
      source.includes("confirmPhotoInvoiceSupplierDocumentAction") &&
      source.includes("Poster POS");
  }

  let pageWired = false;
  if (existsSync(join(root, PHOTO_INVOICE_AI_P2_68_PAGE))) {
    const source = readFileSync(join(root, PHOTO_INVOICE_AI_P2_68_PAGE), "utf8");
    pageWired =
      source.includes("InvoiceScannerClient") && source.includes("Poster POS");
  }

  const corpus = buildPhotoInvoiceAiCorpusP268();
  const result = runPhotoInvoiceAiBenchmarkP268(corpus);
  const artifactPresent = existsSync(join(root, PHOTO_INVOICE_AI_P2_68_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    builderWired &&
    scannerServiceWired &&
    actionWired &&
    panelWired &&
    pageWired &&
    corpus.length === PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: PHOTO_INVOICE_AI_P2_68_POLICY_ID,
    wiringComplete,
    docWired,
    builderWired,
    scannerServiceWired,
    actionWired,
    panelWired,
    pageWired,
    corpusLoaded: corpus.length === PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT,
    scoringPassed: result.passed,
    capabilityCoveragePct: result.capabilityCoveragePct,
    artifactPresent,
    passed,
  };
}

export function formatPhotoInvoiceAiP268AuditLines(
  summary: PhotoInvoiceAiP268AuditSummary,
): string[] {
  return [
    `Photo invoice AI (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Builder: ${summary.builderWired ? "wired" : "missing"}`,
    `Scanner service: ${summary.scannerServiceWired ? "wired" : "missing"}`,
    `Action: ${summary.actionWired ? "wired" : "missing"}`,
    `Panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Page: ${summary.pageWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT} scenarios)`,
    `Capability coverage: ${summary.capabilityCoveragePct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Poster POS parity: ${PHOTO_INVOICE_AI_P2_68_POSTER_POS_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
