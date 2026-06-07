import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditProductHuntLaunchPrepWiring } from "@/lib/marketing/product-hunt-launch-prep-audit";
import {
  PRODUCT_HUNT_LAUNCH_PREP_ABSOLUTE_FINAL_POLICY_ID,
  PRODUCT_HUNT_LAUNCH_PREP_CI_SCRIPTS,
  PRODUCT_HUNT_LAUNCH_PREP_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_SECTIONS,
  PRODUCT_HUNT_LAUNCH_PREP_UNIT_TEST,
} from "@/lib/marketing/product-hunt-launch-prep-absolute-final-policy";

const ROOT = process.cwd();

describe("Product Hunt launch prep (Absolute Final Task 85)", () => {
  it("locks absolute final policy and prep doc path", () => {
    expect(PRODUCT_HUNT_LAUNCH_PREP_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "product-hunt-launch-prep-absolute-final-v1",
    );
    expect(PRODUCT_HUNT_LAUNCH_PREP_DOC).toBe("docs/product-hunt-launch-prep.md");
    expect(PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_SECTIONS).toHaveLength(10);
  });

  it("documents T-minus timeline, human gates, and honesty rule", () => {
    const doc = readFileSync(join(ROOT, PRODUCT_HUNT_LAUNCH_PREP_DOC), "utf8");
    expect(doc).toContain("product-hunt-launch-prep-absolute-final-v1");
    expect(doc).toContain("## T-minus timeline");
    expect(doc).toContain("## Human gate checklist");
    expect(doc).toContain("Honesty rule");
    expect(doc).toContain("lintProductHuntLaunchDeferCopy");
    expect(doc).toContain("T+7 days");
  });

  it("passes wiring audit", () => {
    const audit = auditProductHuntLaunchPrepWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.sectionCount).toBe(PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_SECTIONS.length);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of PRODUCT_HUNT_LAUNCH_PREP_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(PRODUCT_HUNT_LAUNCH_PREP_UNIT_TEST).toBe(
      "tests/unit/product-hunt-launch-prep-absolute-final.test.ts",
    );
  });
});
