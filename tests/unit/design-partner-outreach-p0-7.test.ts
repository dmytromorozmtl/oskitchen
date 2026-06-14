import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DESIGN_PARTNER_MEAL_PREP_P0_7_DOC,
  DESIGN_PARTNER_MEAL_PREP_P0_7_FOUNDER_NAME,
  DESIGN_PARTNER_MEAL_PREP_P0_7_OPERATOR_COUNT,
  DESIGN_PARTNER_MEAL_PREP_P0_7_POLICY_ID,
  DESIGN_PARTNER_MEAL_PREP_P0_7_TARGETS,
} from "@/lib/marketing/design-partner-outreach-meal-prep-p0-7";

const ROOT = process.cwd();

describe("design partner outreach — 10 meal prep operators (P0-7)", () => {
  it("locks P0-7 policy and operator count", () => {
    expect(DESIGN_PARTNER_MEAL_PREP_P0_7_POLICY_ID).toBe(
      "p0-7-design-partner-meal-prep-outreach-v1",
    );
    expect(DESIGN_PARTNER_MEAL_PREP_P0_7_OPERATOR_COUNT).toBe(10);
    expect(DESIGN_PARTNER_MEAL_PREP_P0_7_TARGETS).toHaveLength(10);
  });

  it("includes personalized founder outreach for every operator", () => {
    for (const target of DESIGN_PARTNER_MEAL_PREP_P0_7_TARGETS) {
      expect(target.status).toBe("research_target");
      expect(target.founderSubject.length).toBeGreaterThan(10);
      expect(target.founderBody).toContain(DESIGN_PARTNER_MEAL_PREP_P0_7_FOUNDER_NAME);
      expect(target.founderBody).toContain("[FIRST_NAME]");
      expect(target.founderBody.toLowerCase()).toContain("0 signed founding customers");
      expect(target.founderBody.toLowerCase()).toMatch(/beta|honest|skipped/);
    }
  });

  it("documents all operator ids in P0-7 outreach doc", () => {
    expect(existsSync(join(ROOT, DESIGN_PARTNER_MEAL_PREP_P0_7_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, DESIGN_PARTNER_MEAL_PREP_P0_7_DOC), "utf8");
    expect(doc).toContain("research_target");
    expect(doc).toContain("0 signed founding customers");
    for (const target of DESIGN_PARTNER_MEAL_PREP_P0_7_TARGETS) {
      expect(doc).toContain(target.id);
      expect(doc).toContain(target.founderSubject);
    }
  });

  it("links from main design partner outreach doc", () => {
    const main = readFileSync(join(ROOT, "docs/design-partner-outreach.md"), "utf8");
    expect(main).toContain("design-partner-outreach-meal-prep-p0-7.md");
    expect(main).toContain("p0-7-design-partner-meal-prep-outreach-v1");
  });
});
