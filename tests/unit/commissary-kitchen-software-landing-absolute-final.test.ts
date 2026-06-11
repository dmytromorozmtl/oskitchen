import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditCommissaryKitchenSoftwareLandingWiring } from "@/lib/marketing/commissary-kitchen-software-landing-audit";
import {
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_META,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH,
} from "@/lib/marketing/commissary-kitchen-software-landing-content";
import {
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_CI_SCRIPTS,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_UNIT_TEST,
  COMMISSARY_KITCHEN_SOFTWARE_PRIMARY_KEYWORD,
} from "@/lib/marketing/commissary-kitchen-software-landing-absolute-final-policy";
import { getSeo10IcpKeywordById } from "@/lib/marketing/seo-10-icp-keywords-policy";

const ROOT = process.cwd();

describe("Commissary kitchen software landing (Absolute Final Task 77)", () => {
  it("locks absolute final policy and SEO route", () => {
    expect(COMMISSARY_KITCHEN_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "commissary-kitchen-software-landing-absolute-final-v1",
    );
    expect(COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE).toBe("/commissary-software");
    expect(COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH).toBe("/commissary-software");
    expect(COMMISSARY_KITCHEN_SOFTWARE_PRIMARY_KEYWORD).toBe("commissary kitchen software");
  });

  it("ships SEO metadata with primary keyword", () => {
    expect(COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.keywords).toContain(
      "commissary kitchen software",
    );
    expect(COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.title.toLowerCase()).toContain("commissary");
  });

  it("maps SEO 10 ICP keyword to /commissary-software", () => {
    const entry = getSeo10IcpKeywordById("commissary-kitchen-software");
    expect(entry?.targetPath).toBe("/commissary-software");
    expect(entry?.primaryKeyword).toBe("commissary kitchen software");
    expect(entry?.icpSegment).toBe("commissary");
  });

  it("passes wiring audit", () => {
    const audit = auditCommissaryKitchenSoftwareLandingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of COMMISSARY_KITCHEN_SOFTWARE_LANDING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(COMMISSARY_KITCHEN_SOFTWARE_LANDING_UNIT_TEST).toBe(
      "tests/unit/commissary-kitchen-software-landing-absolute-final.test.ts",
    );
  });
});
