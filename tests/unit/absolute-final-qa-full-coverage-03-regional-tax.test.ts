import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditRegionalTaxComplianceDoc,
  auditRegionalTaxComplianceWiring,
} from "@/lib/compliance/regional-tax-compliance-audit";
import {
  REGIONAL_TAX_COMPLIANCE_ABSOLUTE_FINAL_POLICY_ID,
  REGIONAL_TAX_COMPLIANCE_DOC_PATH,
  REGIONAL_TAX_COMPLIANCE_GAP_REGIONS,
  REGIONAL_TAX_COMPLIANCE_HONESTY_MARKERS,
  REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES,
  REGIONAL_TAX_COMPLIANCE_TAX_SETTINGS_PATH,
  REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES,
} from "@/lib/compliance/regional-tax-compliance-absolute-final-policy";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 103 — QA full coverage for feature 88 regional tax compliance */
const TASK = 103;
const FEATURE = 88;

describe(`QA full coverage — regional tax compliance (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 103 → feature 88 regional tax compliance", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("regional-tax-compliance");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/regional-tax-compliance-absolute-final.test.ts");
  });

  it("audits compliance doc for all six timeline phases and gap regions", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    const docAudit = auditRegionalTaxComplianceDoc(doc);
    expect(docAudit.missingHeadings).toEqual([]);
    expect(docAudit.phaseCount).toBe(REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES.length);
    expect(docAudit.gapRegionCount).toBe(REGIONAL_TAX_COMPLIANCE_GAP_REGIONS.length);
    for (const region of REGIONAL_TAX_COMPLIANCE_GAP_REGIONS) {
      expect(doc).toContain(region);
    }
  });

  it("flags incomplete doc when required phase headings are missing", () => {
    const partial = "## Timeline\nPhase 0 — Baseline\n";
    const docAudit = auditRegionalTaxComplianceDoc(partial);
    expect(docAudit.phaseCount).toBeLessThan(REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES.length);
    expect(docAudit.missingHeadings.length).toBeGreaterThan(0);
  });

  it("documents honesty markers — not tax advice, operator responsibility", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    for (const marker of REGIONAL_TAX_COMPLIANCE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain("Not available");
    expect(doc).toContain("no automated filing");
  });

  it("wires four jurisdiction modes in doc and tax-settings.ts", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    const taxSettings = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_TAX_SETTINGS_PATH), "utf8");
    for (const mode of REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES) {
      expect(doc).toContain(mode);
      expect(taxSettings).toContain(`"${mode}"`);
    }
    expect(doc).toContain("tax-engine.ts");
    expect(doc).toContain("StorefrontTaxSettingsPanel");
  });

  it("wires human gate checklist before tax compliance questionnaires", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    expect(doc).toContain("## Human gate checklist");
    expect(doc).toContain("no automated filing or nexus engine");
    expect(doc).toContain("test:ci:regional-tax-compliance:cert");
    expect(doc).toContain("eu-data-residency-roadmap.md");
  });

  it("provides sales-safe responses for tax compliance buyer asks", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    expect(doc).toContain("## Sales guidance");
    expect(doc).toContain("Do you handle sales tax?");
    expect(doc).toContain("not a tax compliance product");
    expect(doc).toContain("UK VAT ready?");
    expect(doc).toContain("forbidden-claims-training.md");
  });

  it("passes base wiring audit and QA slot 103 audit gate", () => {
    const wiring = auditRegionalTaxComplianceWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
    expect(docContainsPolicyId()).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-03-regional-tax.test.ts",
    );
  });
});

function docContainsPolicyId(): boolean {
  const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
  return doc.includes(REGIONAL_TAX_COMPLIANCE_ABSOLUTE_FINAL_POLICY_ID);
}
