import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CASE_STUDY_1_ERA75_CUSTOMER,
  CASE_STUDY_1_ERA75_DOC,
  CASE_STUDY_1_ERA75_FORBIDDEN_CLAIMS,
  CASE_STUDY_1_ERA75_LONG_FORM_SECTIONS,
  CASE_STUDY_1_ERA75_POLICY_ID,
  CASE_STUDY_1_ERA75_PUBLISH_STATUS,
  CASE_STUDY_1_ERA75_SLUG,
} from "@/lib/marketing/case-study-1-era75-policy";

const ROOT = process.cwd();

function auditCaseStudy1Doc(root = ROOT) {
  const source = readFileSync(join(root, CASE_STUDY_1_ERA75_DOC), "utf8");
  const missingSections = CASE_STUDY_1_ERA75_LONG_FORM_SECTIONS.filter(
    (section) => !source.includes(section),
  );
  return { missingSections, passed: missingSections.length === 0 };
}

function lintCaseStudy1Copy(source: string) {
  const lower = source.toLowerCase();
  const forbiddenHits = CASE_STUDY_1_ERA75_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return { forbiddenHits, passed: forbiddenHits.length === 0 };
}

describe("case study 1 era75", () => {
  it("locks era75 policy, doc path, and slug", () => {
    expect(CASE_STUDY_1_ERA75_POLICY_ID).toBe("era75-case-study-1-v1");
    expect(CASE_STUDY_1_ERA75_DOC).toBe("docs/case-study-1.md");
    expect(CASE_STUDY_1_ERA75_SLUG).toBe("riverbend-commissary-design-partner");
    expect(CASE_STUDY_1_ERA75_PUBLISH_STATUS).toBe("internal_draft");
  });

  it("passes audit on canonical case study 1 doc", () => {
    const audit = auditCaseStudy1Doc();
    expect(audit.passed, audit.missingSections.join("; ")).toBe(true);
  });

  it("records Riverbend design partner case study with Week 1 metrics", () => {
    const source = readFileSync(join(ROOT, CASE_STUDY_1_ERA75_DOC), "utf8");
    expect(source).toContain(CASE_STUDY_1_ERA75_CUSTOMER);
    expect(source).toContain("12/day");
    expect(source).toContain("9 min");
    expect(source).toContain("internal draft");
    expect(source).toContain("staging");
  });

  it("flags forbidden case study claims", () => {
    const result = lintCaseStudy1Copy(
      "Fabricated operator with production SSO, SOC2, and rush-hour KDS certified fully synced guaranteed ROI.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest internal draft case study copy", () => {
    const source = readFileSync(join(ROOT, CASE_STUDY_1_ERA75_DOC), "utf8");
    const result = lintCaseStudy1Copy(source);
    expect(result.passed).toBe(true);
  });
});
