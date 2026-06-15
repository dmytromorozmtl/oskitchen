import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ASSESSMENT_PATH = join(process.cwd(), "docs/soc2-readiness-assessment.md");
const PROCUREMENT_PATH = join(process.cwd(), "docs/enterprise-procurement-pack.md");

describe("soc2 readiness assessment doc", () => {
  it("exists with TSC mapping and honesty rules", () => {
    const doc = readFileSync(ASSESSMENT_PATH, "utf8");
    expect(doc).toContain("# SOC 2 readiness assessment — OS Kitchen");
    expect(doc).toContain("soc2-readiness-assessment-v1");
    expect(doc).toContain("Not certified");
    expect(doc).toContain("## Control mapping");
    expect(doc).toContain("CC6");
    expect(doc).toContain("Questionnaire answer templates");
    expect(doc).toContain("enterprise-procurement-pack.md");
  });

  it("aligns with procurement pack no-attestation stance", () => {
    const assessment = readFileSync(ASSESSMENT_PATH, "utf8");
    const procurement = readFileSync(PROCUREMENT_PATH, "utf8");
    expect(assessment).toMatch(/Do\s+\*\*not\*\*\s+claim|Do not claim/i);
    expect(procurement).toContain("not_certified");
    expect(assessment).toMatch(/Not certified|not certified/i);
  });
});
