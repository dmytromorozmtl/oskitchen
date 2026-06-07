import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditRegionalTaxComplianceWiring } from "@/lib/compliance/regional-tax-compliance-audit";
import {
  REGIONAL_TAX_COMPLIANCE_CI_SCRIPTS,
  REGIONAL_TAX_COMPLIANCE_DOC_PATH,
  REGIONAL_TAX_COMPLIANCE_GAP_REGIONS,
  REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES,
  REGIONAL_TAX_COMPLIANCE_ABSOLUTE_FINAL_POLICY_ID,
  REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES,
  REGIONAL_TAX_COMPLIANCE_UNIT_TEST,
} from "@/lib/compliance/regional-tax-compliance-absolute-final-policy";

const ROOT = process.cwd();

describe("Regional tax compliance (Absolute Final Task 88)", () => {
  it("locks absolute final policy and doc path", () => {
    expect(REGIONAL_TAX_COMPLIANCE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "regional-tax-compliance-absolute-final-v1",
    );
    expect(REGIONAL_TAX_COMPLIANCE_DOC_PATH).toBe("docs/regional-tax-compliance.md");
    expect(REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES).toHaveLength(6);
    expect(REGIONAL_TAX_COMPLIANCE_GAP_REGIONS).toHaveLength(6);
    expect(REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES).toEqual([
      "single",
      "us_sales",
      "ca_sales",
      "eu_vat",
    ]);
  });

  it("documents jurisdiction modes and operator responsibility", () => {
    const doc = readFileSync(join(ROOT, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
    expect(doc).toContain("regional-tax-compliance-absolute-final-v1");
    expect(doc).toContain("## Gap analysis by region");
    expect(doc).toContain("operator responsibility");
    expect(doc).toContain("not tax advice");
    expect(doc).toContain("tax-engine.ts");
  });

  it("passes wiring audit", () => {
    const audit = auditRegionalTaxComplianceWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.phaseCount).toBe(6);
    expect(audit.gapRegionCount).toBe(6);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of REGIONAL_TAX_COMPLIANCE_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(REGIONAL_TAX_COMPLIANCE_UNIT_TEST).toBe(
      "tests/unit/regional-tax-compliance-absolute-final.test.ts",
    );
  });
});
