import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPhotoInvoiceAiP268,
  formatPhotoInvoiceAiP268AuditLines,
} from "@/lib/ai/photo-invoice-ai-p2-68-audit";
import {
  buildSupplierDocumentFromScannedInvoice,
  isSupplierDocumentReadyForCreation,
} from "@/lib/ai/photo-invoice-ai-p2-68-builder";
import { buildPhotoInvoiceAiCorpusP268 } from "@/lib/ai/photo-invoice-ai-p2-68-corpus";
import {
  PHOTO_INVOICE_AI_P2_68_ARTIFACT,
  PHOTO_INVOICE_AI_P2_68_CHECK_NPM_SCRIPT,
  PHOTO_INVOICE_AI_P2_68_CI_NPM_SCRIPT,
  PHOTO_INVOICE_AI_P2_68_CI_WORKFLOW,
  PHOTO_INVOICE_AI_P2_68_DOC,
  PHOTO_INVOICE_AI_P2_68_DOCUMENT_CAPABILITIES,
  PHOTO_INVOICE_AI_P2_68_FLOW_STEPS,
  PHOTO_INVOICE_AI_P2_68_MIN_CAPABILITY_COVERAGE_PCT,
  PHOTO_INVOICE_AI_P2_68_POLICY_ID,
  PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT,
  PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_STATUS,
  PHOTO_INVOICE_AI_P2_68_WIRING_PATHS,
} from "@/lib/ai/photo-invoice-ai-p2-68-policy";
import {
  buildDegradedPhotoInvoiceAiP268Scenarios,
  runPhotoInvoiceAiBenchmarkP268,
} from "@/lib/ai/photo-invoice-ai-p2-68-scoring";

const ROOT = process.cwd();

describe("Photo invoice AI — Poster POS parity (P2-68)", () => {
  it("locks P2-68 policy, 12 scenarios, and receipt → supplier document flow", () => {
    expect(PHOTO_INVOICE_AI_P2_68_POLICY_ID).toBe("photo-invoice-ai-p2-68-v1");
    expect(PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT).toBe(12);
    expect(PHOTO_INVOICE_AI_P2_68_MIN_CAPABILITY_COVERAGE_PCT).toBe(100);
    expect(PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_STATUS).toBe("PENDING");
    expect(PHOTO_INVOICE_AI_P2_68_DOCUMENT_CAPABILITIES).toHaveLength(8);
    expect(PHOTO_INVOICE_AI_P2_68_FLOW_STEPS).toEqual([
      "paper-receipt-capture",
      "ai-line-extraction",
      "supplier-document",
    ]);
  });

  it("builds supplier document draft from scanned receipt", () => {
    const [scenario] = buildPhotoInvoiceAiCorpusP268();
    expect(scenario).toBeDefined();
    const draft = buildSupplierDocumentFromScannedInvoice(scenario!.input);
    expect(draft.documentStatus).toBe("PENDING");
    expect(draft.lineItems.length).toBeGreaterThanOrEqual(2);
    expect(draft.receiptImageUrl).toBeTruthy();
    expect(isSupplierDocumentReadyForCreation(draft)).toBe(true);
  });

  it("passes 12-scenario corpus at 100% capability coverage", () => {
    const corpus = buildPhotoInvoiceAiCorpusP268();
    expect(corpus.length).toBe(12);

    const result = runPhotoInvoiceAiBenchmarkP268(corpus);
    expect(result.capabilityCoveragePct).toBe(100);
    expect(result.uncoveredCapabilities).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it("fails degraded corpus with incomplete capability coverage", () => {
    const degraded = buildDegradedPhotoInvoiceAiP268Scenarios();
    expect(runPhotoInvoiceAiBenchmarkP268(degraded).passed).toBe(false);
  });

  it("passes full wiring audit", () => {
    const audit = auditPhotoInvoiceAiP268(ROOT);
    expect(audit.passed, formatPhotoInvoiceAiP268AuditLines(audit).join("\n")).toBe(true);
  });

  it("registers CI scripts and wiring paths", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PHOTO_INVOICE_AI_P2_68_CHECK_NPM_SCRIPT]).toBeTruthy();
    expect(pkg.scripts?.[PHOTO_INVOICE_AI_P2_68_CI_NPM_SCRIPT]).toBeTruthy();

    for (const rel of PHOTO_INVOICE_AI_P2_68_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }

    const ci = readFileSync(join(ROOT, PHOTO_INVOICE_AI_P2_68_CI_WORKFLOW), "utf8");
    expect(ci).toContain(PHOTO_INVOICE_AI_P2_68_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, PHOTO_INVOICE_AI_P2_68_ARTIFACT), "utf8"),
    ) as { policyId: string };
    expect(artifact.policyId).toBe(PHOTO_INVOICE_AI_P2_68_POLICY_ID);

    const doc = readFileSync(join(ROOT, PHOTO_INVOICE_AI_P2_68_DOC), "utf8");
    expect(doc).toContain("Poster POS");
  });
});
