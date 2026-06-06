import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CASE_STUDY_1_ERA75_POLICY_ID } from "@/lib/marketing/case-study-1-era75-policy";
import {
  CASE_STUDY_1_ERA148_CANONICAL_DOC,
  CASE_STUDY_1_ERA148_CANONICAL_POLICY_ID,
  CASE_STUDY_1_ERA148_CAPABILITIES,
  CASE_STUDY_1_ERA148_CUSTOMER,
  CASE_STUDY_1_ERA148_POLICY_ID,
  CASE_STUDY_1_ERA148_PUBLISH_STATUS,
  CASE_STUDY_1_ERA148_SLUG,
  CASE_STUDY_1_ERA148_SUMMARY_ARTIFACT,
  CASE_STUDY_1_ERA148_WIRING_PATHS,
} from "@/lib/marketing/case-study-1-era148-policy";
import {
  auditCaseStudy1DocContent,
  auditCaseStudy1Era148Wiring,
  buildCaseStudy1Era148Summary,
  resolveCaseStudy1Era148ProofStatus,
} from "@/lib/marketing/case-study-1-era148-smoke-summary";

const ROOT = process.cwd();

describe("case study 1 era148", () => {
  it("locks era148 policy and artifact path", () => {
    expect(CASE_STUDY_1_ERA148_POLICY_ID).toBe("era148-case-study-1-v1");
    expect(CASE_STUDY_1_ERA148_SUMMARY_ARTIFACT).toBe(
      "artifacts/case-study-1-era148-smoke-summary.json",
    );
    expect(CASE_STUDY_1_ERA148_CANONICAL_DOC).toBe("docs/case-study-1.md");
    expect(CASE_STUDY_1_ERA148_SLUG).toBe("riverbend-commissary-design-partner");
    expect(CASE_STUDY_1_ERA148_PUBLISH_STATUS).toBe("internal_draft");
    expect(CASE_STUDY_1_ERA148_WIRING_PATHS).toHaveLength(7);
    expect(CASE_STUDY_1_ERA148_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era148 with canonical case study 1 policy", () => {
    expect(CASE_STUDY_1_ERA148_CANONICAL_POLICY_ID).toBe(CASE_STUDY_1_ERA75_POLICY_ID);
  });

  it("audits in-repo first case study wiring", () => {
    const audit = auditCaseStudy1Era148Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CASE_STUDY_1_ERA148_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("passes case study doc audit with Riverbend Week 1 metrics", () => {
    const audit = auditCaseStudy1DocContent(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const source = readFileSync(join(ROOT, CASE_STUDY_1_ERA148_CANONICAL_DOC), "utf8");
    expect(source).toContain(CASE_STUDY_1_ERA148_CUSTOMER);
    expect(source).toContain("12/day");
    expect(source).toContain("9 min");
    expect(source).toContain("internal draft");
    expect(source).toContain("staging");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCaseStudy1Era148ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCaseStudy1Era148ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCaseStudy1Era148Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.caseStudyDocAuditPassed).toBe(true);
    expect(summary.publishStatus).toBe("internal_draft");
    expect(summary.capabilities).toContain("week1_evidence_chain");
  });
});
