import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditCateringManagementLandingWiring } from "@/lib/marketing/catering-management-landing-audit";
import {
  CATERING_MANAGEMENT_LANDING_META,
  CATERING_MANAGEMENT_LANDING_PATH,
} from "@/lib/marketing/catering-management-landing-content";
import {
  CATERING_MANAGEMENT_LANDING_ABSOLUTE_FINAL_POLICY_ID,
  CATERING_MANAGEMENT_LANDING_CI_SCRIPTS,
  CATERING_MANAGEMENT_LANDING_ROUTE,
  CATERING_MANAGEMENT_LANDING_UNIT_TEST,
  CATERING_MANAGEMENT_PRIMARY_KEYWORD,
} from "@/lib/marketing/catering-management-landing-absolute-final-policy";
import { getSeo10IcpKeywordById } from "@/lib/marketing/seo-10-icp-keywords-policy";

const ROOT = process.cwd();

describe("Catering management landing (Absolute Final Task 78)", () => {
  it("locks absolute final policy and SEO route", () => {
    expect(CATERING_MANAGEMENT_LANDING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "catering-management-landing-absolute-final-v1",
    );
    expect(CATERING_MANAGEMENT_LANDING_ROUTE).toBe("/catering-management");
    expect(CATERING_MANAGEMENT_LANDING_PATH).toBe("/catering-management");
    expect(CATERING_MANAGEMENT_PRIMARY_KEYWORD).toBe("catering management software");
  });

  it("ships SEO metadata with primary keyword", () => {
    expect(CATERING_MANAGEMENT_LANDING_META.keywords).toContain("catering management software");
    expect(CATERING_MANAGEMENT_LANDING_META.title.toLowerCase()).toContain("catering");
  });

  it("maps SEO 10 ICP keyword to /catering-management", () => {
    const entry = getSeo10IcpKeywordById("catering-production-software");
    expect(entry?.targetPath).toBe("/catering-management");
    expect(entry?.primaryKeyword).toBe("catering management software");
    expect(entry?.icpSegment).toBe("cross_icp");
  });

  it("passes wiring audit", () => {
    const audit = auditCateringManagementLandingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of CATERING_MANAGEMENT_LANDING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(CATERING_MANAGEMENT_LANDING_UNIT_TEST).toBe(
      "tests/unit/catering-management-landing-absolute-final.test.ts",
    );
  });
});
