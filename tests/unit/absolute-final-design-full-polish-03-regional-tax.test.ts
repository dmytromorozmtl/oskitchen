import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditRegionalTaxComplianceDoc,
  auditRegionalTaxComplianceWiring,
} from "@/lib/compliance/regional-tax-compliance-audit";
import {
  REGIONAL_TAX_COMPLIANCE_DOC_PATH,
  REGIONAL_TAX_COMPLIANCE_GAP_REGIONS,
  REGIONAL_TAX_COMPLIANCE_HONESTY_MARKERS,
  REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES,
  REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES,
} from "@/lib/compliance/regional-tax-compliance-absolute-final-policy";
import { auditDesignFullPolishSlot } from "@/lib/design/absolute-final-design-full-polish-audit";
import {
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  getDesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_DOC_DARK_MODE_MARKER,
  DESIGN_POLISH_DOC_HERO_MARKER,
  DESIGN_POLISH_DOC_REQUIRED_MARKERS,
  DESIGN_POLISH_DOC_STATUS_MARKER,
  DESIGN_POLISH_DOC_TIMELINE_MARKER,
  docUsesDesignPolishTokens,
} from "@/lib/design/absolute-final-design-polish-tokens";

const ROOT = process.cwd();
/** Absolute Final Task 118 — Design full polish for feature 88 regional tax compliance */
const TASK = 118;
const FEATURE = 88;

describe(`Design full polish — regional tax (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 118 → feature 88 regional tax compliance", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("regional-tax-compliance");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("doc");
    expect(slot?.targetPath).toBe(REGIONAL_TAX_COMPLIANCE_DOC_PATH);
  });

  it("applies design polish doc markers to the regional tax compliance guide", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    for (const marker of DESIGN_POLISH_DOC_REQUIRED_MARKERS) {
      expect(doc, `missing ${marker}`).toContain(marker);
    }
    expect(docUsesDesignPolishTokens(doc)).toBe(true);
    expect(doc).toContain(DESIGN_POLISH_DOC_HERO_MARKER);
    expect(doc).toContain(DESIGN_POLISH_DOC_STATUS_MARKER);
    expect(doc).toContain(DESIGN_POLISH_DOC_TIMELINE_MARKER);
  });

  it("includes dark-mode-safe doc polish note for GitHub readers", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    expect(doc).toContain(DESIGN_POLISH_DOC_DARK_MODE_MARKER);
    expect(doc).toContain("GitHub light and dark themes");
    expect(doc).toContain("without custom HTML colors");
  });

  it("preserves hero honesty — not tax advice and operator responsibility", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    for (const marker of REGIONAL_TAX_COMPLIANCE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain("not automated filing");
    expect(doc).toContain("Operators configure rates");
  });

  it("keeps timeline, gap regions, and jurisdiction modes after visual polish", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    const docAudit = auditRegionalTaxComplianceDoc(doc);
    expect(docAudit.missingHeadings).toEqual([]);
    expect(docAudit.phaseCount).toBe(REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES.length);
    expect(docAudit.gapRegionCount).toBe(REGIONAL_TAX_COMPLIANCE_GAP_REGIONS.length);
    for (const mode of REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES) {
      expect(doc).toContain(mode);
    }
    expect(doc).toContain("## Gap analysis by region");
    expect(doc).toContain("## Human gate checklist");
    expect(doc).toContain("## Sales guidance");
  });

  it("wires design polish policy id in doc header comment", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    expect(doc).toContain(`design-polish: ${DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}`);
    expect(doc).toContain("task-118");
    expect(doc).toContain("feature-88");
  });

  it("passes base regional tax wiring audit after doc polish", () => {
    const wiring = auditRegionalTaxComplianceWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 118 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-03-regional-tax.test.ts",
    );
  });
});
