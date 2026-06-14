import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLinkedInContentPlanP259,
  formatLinkedInContentPlanP259AuditLines,
} from "@/lib/marketing/linkedin-content-plan-p2-59-audit";
import {
  buildLinkedInUtmUrl,
  getLinkedInFounderPostForWeekday,
  LINKEDIN_FOUNDER_POSTS_PER_WEEK,
} from "@/lib/marketing/linkedin-content-plan-p2-59-content";
import {
  LINKEDIN_CONTENT_PLAN_P2_59_ARTIFACT,
  LINKEDIN_CONTENT_PLAN_P2_59_CHECK_NPM_SCRIPT,
  LINKEDIN_CONTENT_PLAN_P2_59_CI_NPM_SCRIPT,
  LINKEDIN_CONTENT_PLAN_P2_59_CI_WORKFLOW,
  LINKEDIN_CONTENT_PLAN_P2_59_DOC,
  LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID,
  LINKEDIN_CONTENT_PLAN_P2_59_POSTS_PER_WEEK,
  LINKEDIN_CONTENT_PLAN_P2_59_UNIT_TEST,
  LINKEDIN_CONTENT_PLAN_P2_59_WEEKDAY_SLOTS,
  LINKEDIN_CONTENT_PLAN_P2_59_WIRING_PATHS,
} from "@/lib/marketing/linkedin-content-plan-p2-59-policy";

const ROOT = process.cwd();

describe("LinkedIn content plan (P2-59)", () => {
  it("locks policy id and 3 founder-led posts per week", () => {
    expect(LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID).toBe("linkedin-content-plan-p2-59-v1");
    expect(LINKEDIN_CONTENT_PLAN_P2_59_POSTS_PER_WEEK).toBe(3);
    expect(LINKEDIN_FOUNDER_POSTS_PER_WEEK).toHaveLength(3);
    expect(LINKEDIN_CONTENT_PLAN_P2_59_WEEKDAY_SLOTS).toEqual([
      "monday",
      "wednesday",
      "friday",
    ]);
  });

  it("defines Mon/Wed/Fri founder post slots with honesty markers", () => {
    for (const weekday of LINKEDIN_CONTENT_PLAN_P2_59_WEEKDAY_SLOTS) {
      const post = getLinkedInFounderPostForWeekday(weekday);
      expect(post.bodyTemplate.length).toBeGreaterThan(50);
      expect(post.utmCampaign.startsWith("founder_")).toBe(true);
    }
    const friday = getLinkedInFounderPostForWeekday("friday");
    expect(friday.bodyTemplate.toLowerCase()).toMatch(/design partner|0 signed|founder/);
  });

  it("builds UTM URLs with linkedin source", () => {
    const url = buildLinkedInUtmUrl("/demo", "founder_operator_clarity");
    expect(url).toContain("utm_source=linkedin");
    expect(url).toContain("utm_campaign=founder_operator_clarity");
    expect(url).toContain("https://os-kitchen.com/demo");
  });

  it("passes full P2-59 LinkedIn content plan audit", () => {
    const summary = auditLinkedInContentPlanP259(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.threePostsPerWeekOk).toBe(true);
    expect(summary.founderLedOk).toBe(true);
    expect(summary.weekdaySlotsOk).toBe(true);
    expect(summary.utmDisciplineOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-59 wiring paths, CI gate, and artifact", () => {
    for (const path of LINKEDIN_CONTENT_PLAN_P2_59_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LINKEDIN_CONTENT_PLAN_P2_59_CHECK_NPM_SCRIPT]).toContain(
      LINKEDIN_CONTENT_PLAN_P2_59_UNIT_TEST,
    );
    expect(pkg.scripts?.[LINKEDIN_CONTENT_PLAN_P2_59_CI_NPM_SCRIPT]).toContain(
      LINKEDIN_CONTENT_PLAN_P2_59_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, LINKEDIN_CONTENT_PLAN_P2_59_CI_WORKFLOW), "utf8");
    expect(ci).toContain(LINKEDIN_CONTENT_PLAN_P2_59_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, LINKEDIN_CONTENT_PLAN_P2_59_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID);
    expect(artifact.postsPerWeek).toBe(3);
    expect(artifact.channel).toBe("founder-led");

    const doc = readFileSync(join(ROOT, LINKEDIN_CONTENT_PLAN_P2_59_DOC), "utf8");
    expect(doc).toContain(LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditLinkedInContentPlanP259(ROOT);
    const lines = formatLinkedInContentPlanP259AuditLines(summary);
    expect(lines.some((line) => line.includes(LINKEDIN_CONTENT_PLAN_P2_59_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
