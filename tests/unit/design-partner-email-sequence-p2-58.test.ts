import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDesignPartnerEmailSequenceP258,
  formatDesignPartnerEmailSequenceP258AuditLines,
} from "@/lib/marketing/design-partner-email-sequence-p2-58-audit";
import {
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS,
  getDesignPartnerEmailSequenceP258Step,
  renderDesignPartnerEmailBody,
} from "@/lib/marketing/design-partner-email-sequence-p2-58-content";
import {
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_ARTIFACT,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CHECK_NPM_SCRIPT,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CI_NPM_SCRIPT,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CI_WORKFLOW,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DOC,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_COUNT,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_IDS,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_UNIT_TEST,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_WIRING_PATHS,
} from "@/lib/marketing/design-partner-email-sequence-p2-58-policy";

const ROOT = process.cwd();

describe("Design partner email sequence (P2-58)", () => {
  it("locks policy id and 5-step problem→solution→demo→offer→follow_up order", () => {
    expect(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID).toBe(
      "design-partner-email-sequence-p2-58-v1",
    );
    expect(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_COUNT).toBe(5);
    expect(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_IDS).toEqual([
      "problem",
      "solution",
      "demo",
      "offer",
      "follow_up",
    ]);
    expect(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS.map((s) => s.id)).toEqual(
      DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_IDS,
    );
  });

  it("each step has subject lines, body, and honesty markers", () => {
    for (const step of DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS) {
      expect(step.subjectLines).toHaveLength(2);
      expect(step.bodyTemplate.length).toBeGreaterThan(100);
      expect(step.bodyTemplate.toLowerCase()).toMatch(/beta|honest|0 signed|skipped|not a fit/);
    }
    const offer = getDesignPartnerEmailSequenceP258Step("offer");
    expect(offer.bodyTemplate.toLowerCase()).toContain("90 days");
    expect(offer.attachments).toContain("docs/loi-design-partner-template.md");
    const demo = getDesignPartnerEmailSequenceP258Step("demo");
    expect(demo.bodyTemplate).toContain("[DEMO_URL]");
  });

  it("renders personalization tokens in email body", () => {
    const problem = getDesignPartnerEmailSequenceP258Step("problem");
    const rendered = renderDesignPartnerEmailBody(problem.bodyTemplate, {
      FIRST_NAME: "Jane",
      FOUNDER_NAME: "Dmytro",
      SEGMENT: "meal prep",
      PAIN_HOOK: "Thursday cutoff chaos",
      COHORT_SIZE: "5",
      BOOK_DEMO_URL: "https://os-kitchen.com/book-demo",
      OPERATOR_NAME: "Example Kitchen",
    });
    expect(rendered).toContain("Jane");
    expect(rendered).not.toContain("[FIRST_NAME]");
  });

  it("passes full P2-58 design partner email sequence audit", () => {
    const summary = auditDesignPartnerEmailSequenceP258(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.fiveStepsOk).toBe(true);
    expect(summary.stepOrderOk).toBe(true);
    expect(summary.loiLinked).toBe(true);
    expect(summary.offerWired).toBe(true);
    expect(summary.demoWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-58 wiring paths, CI gate, and artifact", () => {
    for (const path of DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CHECK_NPM_SCRIPT]).toContain(
      DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_UNIT_TEST,
    );
    expect(pkg.scripts?.[DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CI_NPM_SCRIPT]).toContain(
      DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CI_WORKFLOW), "utf8");
    expect(ci).toContain(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID);
    expect(artifact.stepCount).toBe(5);

    const doc = readFileSync(join(ROOT, DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DOC), "utf8");
    expect(doc).toContain(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditDesignPartnerEmailSequenceP258(ROOT);
    const lines = formatDesignPartnerEmailSequenceP258AuditLines(summary);
    expect(lines.some((line) => line.includes(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
