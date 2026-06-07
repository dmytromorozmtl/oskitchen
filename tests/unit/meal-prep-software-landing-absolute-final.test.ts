import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditMealPrepSoftwareLandingWiring } from "@/lib/marketing/meal-prep-software-landing-audit";
import {
  MEAL_PREP_SOFTWARE_LANDING_PATH,
  MEAL_PREP_SOFTWARE_LANDING_META,
} from "@/lib/marketing/meal-prep-software-landing-content";
import {
  MEAL_PREP_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID,
  MEAL_PREP_SOFTWARE_LANDING_CI_SCRIPTS,
  MEAL_PREP_SOFTWARE_LANDING_ROUTE,
  MEAL_PREP_SOFTWARE_LANDING_UNIT_TEST,
  MEAL_PREP_SOFTWARE_PRIMARY_KEYWORD,
} from "@/lib/marketing/meal-prep-software-landing-absolute-final-policy";
import { getSeo10IcpKeywordById } from "@/lib/marketing/seo-10-icp-keywords-policy";

const ROOT = process.cwd();

describe("Meal prep software landing (Absolute Final Task 76)", () => {
  it("locks absolute final policy and SEO route", () => {
    expect(MEAL_PREP_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "meal-prep-software-landing-absolute-final-v1",
    );
    expect(MEAL_PREP_SOFTWARE_LANDING_ROUTE).toBe("/meal-prep-software");
    expect(MEAL_PREP_SOFTWARE_LANDING_PATH).toBe("/meal-prep-software");
    expect(MEAL_PREP_SOFTWARE_PRIMARY_KEYWORD).toBe("meal prep software");
  });

  it("ships SEO metadata with primary keyword", () => {
    expect(MEAL_PREP_SOFTWARE_LANDING_META.keywords).toContain("meal prep software");
    expect(MEAL_PREP_SOFTWARE_LANDING_META.title.toLowerCase()).toContain("meal prep");
  });

  it("maps SEO 10 ICP keyword to /meal-prep-software", () => {
    const entry = getSeo10IcpKeywordById("meal-prep-software");
    expect(entry?.targetPath).toBe("/meal-prep-software");
    expect(entry?.primaryKeyword).toBe("meal prep software");
  });

  it("passes wiring audit", () => {
    const audit = auditMealPrepSoftwareLandingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of MEAL_PREP_SOFTWARE_LANDING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(MEAL_PREP_SOFTWARE_LANDING_UNIT_TEST).toBe(
      "tests/unit/meal-prep-software-landing-absolute-final.test.ts",
    );
  });
});
