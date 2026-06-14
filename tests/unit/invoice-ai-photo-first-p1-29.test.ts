import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INVOICE_AI_PHOTO_FIRST_P1_29_ACTION,
  INVOICE_AI_PHOTO_FIRST_P1_29_ARTIFACT,
  INVOICE_AI_PHOTO_FIRST_P1_29_CAMERA_TEST_ID,
  INVOICE_AI_PHOTO_FIRST_P1_29_CHECK_NPM_SCRIPT,
  INVOICE_AI_PHOTO_FIRST_P1_29_CI_NPM_SCRIPT,
  INVOICE_AI_PHOTO_FIRST_P1_29_CI_WORKFLOW,
  INVOICE_AI_PHOTO_FIRST_P1_29_CONFIRM_TEST_ID,
  INVOICE_AI_PHOTO_FIRST_P1_29_DOC,
  INVOICE_AI_PHOTO_FIRST_P1_29_DRAFT_PO_STATUS,
  INVOICE_AI_PHOTO_FIRST_P1_29_FLOW_STEPS,
  INVOICE_AI_PHOTO_FIRST_P1_29_INVOICES_PAGE,
  INVOICE_AI_PHOTO_FIRST_P1_29_PANEL_TEST_ID,
  INVOICE_AI_PHOTO_FIRST_P1_29_POLICY_ID,
  INVOICE_AI_PHOTO_FIRST_P1_29_SCANNER_COMPONENT,
  INVOICE_AI_PHOTO_FIRST_P1_29_SERVICE,
  INVOICE_AI_PHOTO_FIRST_P1_29_WIRING_PATHS,
} from "@/lib/ai/invoice-ai-photo-first-p1-29-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Invoice AI photo-first capture (P1-29)", () => {
  it("locks P1-29 policy and photo → line items → draft PO flow", () => {
    expect(INVOICE_AI_PHOTO_FIRST_P1_29_POLICY_ID).toBe("invoice-ai-photo-first-p1-29-v1");
    expect(INVOICE_AI_PHOTO_FIRST_P1_29_FLOW_STEPS).toEqual([
      "photo-capture",
      "ai-line-items",
      "draft-po",
    ]);
    expect(INVOICE_AI_PHOTO_FIRST_P1_29_DRAFT_PO_STATUS).toBe("DRAFT");
  });

  it("service exports createDraftPurchaseOrderFromInvoice with DRAFT status", () => {
    const service = readSource(INVOICE_AI_PHOTO_FIRST_P1_29_SERVICE);
    expect(service).toContain("export async function createDraftPurchaseOrderFromInvoice");
    expect(service).toContain('status: "DRAFT"');
    expect(service).toContain("Photo-first draft PO");
  });

  it("action wires confirmInvoiceScanDraftPoAction", () => {
    const action = readSource(INVOICE_AI_PHOTO_FIRST_P1_29_ACTION);
    expect(action).toContain("export async function confirmInvoiceScanDraftPoAction");
    expect(action).toContain("createDraftPurchaseOrderFromInvoice");
  });

  it("scanner component is photo-first with draft PO confirm", () => {
    const component = readSource(INVOICE_AI_PHOTO_FIRST_P1_29_SCANNER_COMPONENT);
    expect(component).toContain(`data-testid="${INVOICE_AI_PHOTO_FIRST_P1_29_PANEL_TEST_ID}"`);
    expect(component).toContain(`data-testid="${INVOICE_AI_PHOTO_FIRST_P1_29_CAMERA_TEST_ID}"`);
    expect(component).toContain(`data-testid="${INVOICE_AI_PHOTO_FIRST_P1_29_CONFIRM_TEST_ID}"`);
    expect(component).toContain("confirmInvoiceScanDraftPoAction");
    expect(component).toContain("Create draft PO");
    expect(component).toContain("Take Photo");
  });

  it("accounting invoices page embeds photo-first scanner", () => {
    const page = readSource(INVOICE_AI_PHOTO_FIRST_P1_29_INVOICES_PAGE);
    expect(page).toContain("InvoiceScannerClient");
    expect(page).toContain("Photo-first");
  });

  it("P1-29 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of INVOICE_AI_PHOTO_FIRST_P1_29_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${INVOICE_AI_PHOTO_FIRST_P1_29_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${INVOICE_AI_PHOTO_FIRST_P1_29_CI_NPM_SCRIPT}"`);

    const ci = readSource(INVOICE_AI_PHOTO_FIRST_P1_29_CI_WORKFLOW);
    expect(ci).toContain(INVOICE_AI_PHOTO_FIRST_P1_29_CHECK_NPM_SCRIPT);

    const doc = readSource(INVOICE_AI_PHOTO_FIRST_P1_29_DOC);
    expect(doc).toContain(INVOICE_AI_PHOTO_FIRST_P1_29_POLICY_ID);

    const artifact = JSON.parse(readSource(INVOICE_AI_PHOTO_FIRST_P1_29_ARTIFACT));
    expect(artifact.policyId).toBe(INVOICE_AI_PHOTO_FIRST_P1_29_POLICY_ID);
    expect(artifact.draftPoStatus).toBe("DRAFT");
  });
});
