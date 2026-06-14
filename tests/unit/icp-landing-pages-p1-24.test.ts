import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ICP_LANDING_P1_24_GHOST_KITCHEN_HERO,
  ICP_LANDING_P1_24_GHOST_KITCHEN_PAINS,
  ICP_LANDING_P1_24_MEAL_PREP_HERO,
  ICP_LANDING_P1_24_MEAL_PREP_PAINS,
} from "@/lib/marketing/icp-landing-pages-p1-24-content";
import {
  ICP_LANDING_PAGES_P1_24_ARTIFACT,
  ICP_LANDING_PAGES_P1_24_BRIDGE_COMPONENT,
  ICP_LANDING_PAGES_P1_24_CHECK_NPM_SCRIPT,
  ICP_LANDING_PAGES_P1_24_CI_NPM_SCRIPT,
  ICP_LANDING_PAGES_P1_24_CI_WORKFLOW,
  ICP_LANDING_PAGES_P1_24_CONTENT_MODULE,
  ICP_LANDING_PAGES_P1_24_DOC,
  ICP_LANDING_PAGES_P1_24_ENTRIES,
  ICP_LANDING_PAGES_P1_24_PAIN_MARKERS,
  ICP_LANDING_PAGES_P1_24_POLICY_ID,
  ICP_LANDING_PAGES_P1_24_WIRING_PATHS,
} from "@/lib/marketing/icp-landing-pages-p1-24-policy";
import { RICH_SOLUTION_LANDING } from "@/lib/marketing/solution-landing-content";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("ICP landing pages — pain-first optimization (P1-24)", () => {
  it("locks P1-24 policy and pain-first hero copy", () => {
    expect(ICP_LANDING_PAGES_P1_24_POLICY_ID).toBe("icp-landing-pages-p1-24-v1");
    expect(ICP_LANDING_P1_24_MEAL_PREP_HERO.h1).toContain("spreadsheet");
    expect(ICP_LANDING_P1_24_GHOST_KITCHEN_HERO.h1).toContain("tablet");
    expect(RICH_SOLUTION_LANDING["meal-prep"].h1).toBe(ICP_LANDING_P1_24_MEAL_PREP_HERO.h1);
    expect(RICH_SOLUTION_LANDING["ghost-kitchens"].h1).toBe(
      ICP_LANDING_P1_24_GHOST_KITCHEN_HERO.h1,
    );
  });

  it("structures meal prep and ghost kitchen pains with symptom, cost, and solution", () => {
    for (const pains of [ICP_LANDING_P1_24_MEAL_PREP_PAINS, ICP_LANDING_P1_24_GHOST_KITCHEN_PAINS]) {
      expect(pains).toHaveLength(3);
      for (const pain of pains) {
        for (const marker of ICP_LANDING_PAGES_P1_24_PAIN_MARKERS) {
          expect(pain[marker as keyof typeof pain], `${pain.id} missing ${marker}`).toBeTruthy();
        }
      }
    }
  });

  it("wires IcpPainSolutionBridgeSection on both ICP landing components", () => {
    for (const entry of ICP_LANDING_PAGES_P1_24_ENTRIES) {
      const source = readSource(entry.componentPath);
      expect(source).toContain("IcpPainSolutionBridgeSection");
      expect(source).toContain(entry.bridgeTestId);
      expect(source).toContain("icpLandingP124HeroForSegment");
    }
  });

  it("exports P1-24 pain arrays from landing content modules", () => {
    expect(readSource("lib/marketing/meal-prep-software-landing-content.ts")).toContain(
      "MEAL_PREP_SOFTWARE_PAIN_POINTS_P1_24",
    );
    expect(readSource("lib/marketing/ghost-kitchen-landing-content.ts")).toContain(
      "GHOST_KITCHEN_PAIN_POINTS_P1_24",
    );
  });

  it("P1-24 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of ICP_LANDING_PAGES_P1_24_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${ICP_LANDING_PAGES_P1_24_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${ICP_LANDING_PAGES_P1_24_CI_NPM_SCRIPT}"`);

    const ci = readSource(ICP_LANDING_PAGES_P1_24_CI_WORKFLOW);
    expect(ci).toContain(ICP_LANDING_PAGES_P1_24_CHECK_NPM_SCRIPT);

    const doc = readSource(ICP_LANDING_PAGES_P1_24_DOC);
    expect(doc).toContain(ICP_LANDING_PAGES_P1_24_POLICY_ID);

    expect(existsSync(join(ROOT, ICP_LANDING_PAGES_P1_24_CONTENT_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, ICP_LANDING_PAGES_P1_24_BRIDGE_COMPONENT))).toBe(true);

    const artifact = JSON.parse(readSource(ICP_LANDING_PAGES_P1_24_ARTIFACT));
    expect(artifact.policyId).toBe(ICP_LANDING_PAGES_P1_24_POLICY_ID);
  });
});
