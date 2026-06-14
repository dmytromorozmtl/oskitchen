import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCaseStudyTemplatePipelineP256,
  formatCaseStudyTemplatePipelineP256AuditLines,
} from "@/lib/marketing/case-study-template-pipeline-p2-56-audit";
import {
  computePublishReviewDate,
  resolveCaseStudyPipelineStage,
} from "@/lib/marketing/case-study-template-pipeline-p2-56-measurement";
import {
  CASE_STUDY_PIPELINE_P2_56_PUBLISH_REVIEW_DAYS,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_ARTIFACT,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CHECK_NPM_SCRIPT,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CI_NPM_SCRIPT,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CI_WORKFLOW,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_FILL_IN_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_STAGES,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_WIRING_PATHS,
} from "@/lib/marketing/case-study-template-pipeline-p2-56-policy";

const ROOT = process.cwd();

describe("Case study template pipeline (P2-56)", () => {
  it("locks policy id, five pipeline stages, and 30-day publish review", () => {
    expect(CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID).toBe(
      "case-study-template-pipeline-p2-56-v1",
    );
    expect(CASE_STUDY_TEMPLATE_PIPELINE_P2_56_STAGES).toHaveLength(5);
    expect(CASE_STUDY_PIPELINE_P2_56_PUBLISH_REVIEW_DAYS).toBe(30);
    expect(computePublishReviewDate("2026-06-01")).toBe("2026-07-01");
  });

  it("resolves pre-LOI template before LOI and day-30 review after pilot start", () => {
    expect(
      resolveCaseStudyPipelineStage({
        loiSignedDate: null,
        pilotStartDate: null,
        customerApproval: "none",
        publishGatesPassed: false,
      }).stage,
    ).toBe("pre_loi_template");

    expect(
      resolveCaseStudyPipelineStage({
        loiSignedDate: "2026-06-01",
        pilotStartDate: "2026-06-01",
        customerApproval: "none",
        publishGatesPassed: false,
        asOf: new Date("2026-06-15"),
      }).stage,
    ).toBe("pilot_active_w1");

    expect(
      resolveCaseStudyPipelineStage({
        loiSignedDate: "2026-06-01",
        pilotStartDate: "2026-06-01",
        customerApproval: "none",
        publishGatesPassed: false,
        asOf: new Date("2026-07-05"),
      }).stage,
    ).toBe("pilot_day_30_publish_review");
  });

  it("passes full P2-56 case study pipeline audit", () => {
    const summary = auditCaseStudyTemplatePipelineP256(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.fillInWired).toBe(true);
    expect(summary.loiTemplateLinked).toBe(true);
    expect(summary.preLoiTemplateLinked).toBe(true);
    expect(summary.publishReviewDaysOk).toBe(true);
    expect(summary.pipelineResolutionOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-56 wiring paths exist including doc, checklist, LOI, and CI gate", () => {
    for (const path of CASE_STUDY_TEMPLATE_PIPELINE_P2_56_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CHECK_NPM_SCRIPT]).toContain(
      CASE_STUDY_TEMPLATE_PIPELINE_P2_56_UNIT_TEST,
    );
    expect(pkg.scripts?.[CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CI_NPM_SCRIPT]).toContain(
      CASE_STUDY_TEMPLATE_PIPELINE_P2_56_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CI_WORKFLOW), "utf8");
    expect(ci).toContain(CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CHECK_NPM_SCRIPT);

    const doc = readFileSync(join(ROOT, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_DOC), "utf8");
    expect(doc).toContain(CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID);

    const fillIn = readFileSync(join(ROOT, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_FILL_IN_DOC), "utf8");
    expect(fillIn).toContain("pre_loi_template");

    const artifact = JSON.parse(
      readFileSync(join(ROOT, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID);
    expect(artifact.publishReviewDaysAfterPilotStart).toBe(30);
  });

  it("formats audit lines", () => {
    const summary = auditCaseStudyTemplatePipelineP256(ROOT);
    const lines = formatCaseStudyTemplatePipelineP256AuditLines(summary);
    expect(lines.some((line) => line.includes(CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});

const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_UNIT_TEST =
  "tests/unit/case-study-template-pipeline-p2-56.test.ts";
