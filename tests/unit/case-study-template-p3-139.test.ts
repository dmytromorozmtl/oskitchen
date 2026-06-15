import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCaseStudyTemplateP3_139,
  formatCaseStudyTemplateP3_139AuditLines,
} from "@/lib/pm/case-study-template-p3-139-audit";
import {
  loadCaseStudyTemplatePmRegistry,
  validateCaseStudyTemplatePmRegistry,
} from "@/lib/pm/case-study-template-p3-139-operations";
import {
  CASE_STUDY_TEMPLATE_P3_139_CI_WORKFLOW,
  CASE_STUDY_TEMPLATE_P3_139_DOC,
  CASE_STUDY_TEMPLATE_P3_139_IMPLEMENTATION_REF,
  CASE_STUDY_TEMPLATE_P3_139_NPM_SCRIPT,
  CASE_STUDY_TEMPLATE_P3_139_POLICY_ID,
  CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS,
  CASE_STUDY_TEMPLATE_P3_139_TEMPLATE_TYPE,
  CASE_STUDY_TEMPLATE_P3_139_UNIT_TEST,
} from "@/lib/pm/case-study-template-p3-139-policy";

const ROOT = process.cwd();

describe("Case study template PM (P3-139)", () => {
  it("locks policy id, template type, and section count", () => {
    expect(CASE_STUDY_TEMPLATE_P3_139_POLICY_ID).toBe("case-study-template-p3-139-v1");
    expect(CASE_STUDY_TEMPLATE_P3_139_TEMPLATE_TYPE).toBe("pre_pilot_founder_story");
    expect(CASE_STUDY_TEMPLATE_P3_139_IMPLEMENTATION_REF).toBe(
      "case-study-template-pre-pilot-absolute-final-v1",
    );
    expect(CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS).toHaveLength(7);
  });

  it("validates registry with zero published case studies", () => {
    const registry = loadCaseStudyTemplatePmRegistry(ROOT);
    const validation = validateCaseStudyTemplatePmRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroPublished).toBe(true);
    expect(registry.publishedCaseStudyCount).toBe(0);
    expect(registry.sections).toHaveLength(7);
  });

  it("passes full case study template PM audit", () => {
    const summary = auditCaseStudyTemplateP3_139(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.livePrePilotAuditPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.sectionsDocumented).toBe(true);
    expect(summary.founderStoryDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, CASE_STUDY_TEMPLATE_P3_139_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CASE_STUDY_TEMPLATE_P3_139_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CASE_STUDY_TEMPLATE_P3_139_NPM_SCRIPT]).toContain(
      "audit-case-study-template-p3-139.ts",
    );
    expect(pkg.scripts?.["test:ci:case-study-template-p3-139"]).toContain(
      CASE_STUDY_TEMPLATE_P3_139_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, CASE_STUDY_TEMPLATE_P3_139_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:case-study-template-p3-139");
  });

  it("formats audit lines", () => {
    const summary = auditCaseStudyTemplateP3_139(ROOT);
    const lines = formatCaseStudyTemplateP3_139AuditLines(summary);
    expect(lines.some((line) => line.includes(CASE_STUDY_TEMPLATE_P3_139_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
