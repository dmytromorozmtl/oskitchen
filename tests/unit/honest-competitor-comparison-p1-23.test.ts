import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { comparePageBySlug } from "@/lib/marketing/compare-content";
import {
  HONEST_COMPARE_LIGHTSPEED_ROWS,
  HONEST_COMPARE_SQUARE_ROWS,
  HONEST_COMPARE_TOAST_ROWS,
  validateHonestCompareKitchenOsCells,
} from "@/lib/marketing/honest-competitor-comparison-p1-23-content";
import {
  HONEST_COMPETITOR_COMPARISON_P1_23_ARTIFACT,
  HONEST_COMPETITOR_COMPARISON_P1_23_CHECK_NPM_SCRIPT,
  HONEST_COMPETITOR_COMPARISON_P1_23_CI_NPM_SCRIPT,
  HONEST_COMPETITOR_COMPARISON_P1_23_CI_WORKFLOW,
  HONEST_COMPETITOR_COMPARISON_P1_23_COMPARE_LANDING,
  HONEST_COMPETITOR_COMPARISON_P1_23_CONTENT_MODULE,
  HONEST_COMPETITOR_COMPARISON_P1_23_DOC,
  HONEST_COMPETITOR_COMPARISON_P1_23_ENTRIES,
  HONEST_COMPETITOR_COMPARISON_P1_23_HARDWARE_BANNED,
  HONEST_COMPETITOR_COMPARISON_P1_23_POLICY_ID,
  HONEST_COMPETITOR_COMPARISON_P1_23_TEST_ID,
  HONEST_COMPETITOR_COMPARISON_P1_23_WIRING_PATHS,
} from "@/lib/marketing/honest-competitor-comparison-p1-23-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function serializeComparePage(slug: string): string {
  const page = comparePageBySlug(slug);
  if (!page) return "";
  return JSON.stringify({
    metaDescription: page.metaDescription,
    methodology: page.methodology,
    rows: page.comparison.rows,
    disclaimer: page.disclaimer,
    faqs: page.faqs,
    whenToChoose: page.whenToChoose,
  });
}

describe("Honest competitor comparison pages (P1-23)", () => {
  it("locks P1-23 policy and LIVE-only row modules", () => {
    expect(HONEST_COMPETITOR_COMPARISON_P1_23_POLICY_ID).toBe(
      "honest-competitor-comparison-p1-23-v1",
    );
    expect(validateHonestCompareKitchenOsCells(HONEST_COMPARE_TOAST_ROWS)).toBe(true);
    expect(validateHonestCompareKitchenOsCells(HONEST_COMPARE_SQUARE_ROWS)).toBe(true);
    expect(validateHonestCompareKitchenOsCells(HONEST_COMPARE_LIGHTSPEED_ROWS)).toBe(true);
  });

  it("wires honest LIVE-only rows into toast, square, and lightspeed compare pages", () => {
    for (const entry of HONEST_COMPETITOR_COMPARISON_P1_23_ENTRIES) {
      const page = comparePageBySlug(entry.slug);
      expect(page?.path).toBe(entry.path);
      expect(page?.comparison.rows).toEqual(
        entry.slug === "toast"
          ? HONEST_COMPARE_TOAST_ROWS
          : entry.slug === "square"
            ? HONEST_COMPARE_SQUARE_ROWS
            : HONEST_COMPARE_LIGHTSPEED_ROWS,
      );
      expect(page?.comparisonTag).toContain("LIVE");
      expect(page?.methodology).toContain("LIVE");
    }
  });

  it("excludes hardware comparison markers from P1-23 compare pages", () => {
    for (const entry of HONEST_COMPETITOR_COMPARISON_P1_23_ENTRIES) {
      const blob = serializeComparePage(entry.slug).toLowerCase();
      for (const banned of HONEST_COMPETITOR_COMPARISON_P1_23_HARDWARE_BANNED) {
        expect(blob, `${entry.slug} contains banned: ${banned}`).not.toContain(
          banned.toLowerCase(),
        );
      }
    }
  });

  it("compare landing exposes honesty banner test id for incumbent pages", () => {
    const landing = readSource(HONEST_COMPETITOR_COMPARISON_P1_23_COMPARE_LANDING);
    expect(landing).toContain(HONEST_COMPETITOR_COMPARISON_P1_23_TEST_ID);
    expect(landing).toContain("HONEST_COMPETITOR_COMPARISON_P1_23_SLUGS");
    expect(landing).toContain("Hardware terminals and payment readers are not compared");
  });

  it("P1-23 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of HONEST_COMPETITOR_COMPARISON_P1_23_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${HONEST_COMPETITOR_COMPARISON_P1_23_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${HONEST_COMPETITOR_COMPARISON_P1_23_CI_NPM_SCRIPT}"`);

    const ci = readSource(HONEST_COMPETITOR_COMPARISON_P1_23_CI_WORKFLOW);
    expect(ci).toContain(HONEST_COMPETITOR_COMPARISON_P1_23_CHECK_NPM_SCRIPT);

    const doc = readSource(HONEST_COMPETITOR_COMPARISON_P1_23_DOC);
    expect(doc).toContain(HONEST_COMPETITOR_COMPARISON_P1_23_POLICY_ID);

    expect(existsSync(join(ROOT, HONEST_COMPETITOR_COMPARISON_P1_23_CONTENT_MODULE))).toBe(true);

    const artifact = JSON.parse(readSource(HONEST_COMPETITOR_COMPARISON_P1_23_ARTIFACT));
    expect(artifact.policyId).toBe(HONEST_COMPETITOR_COMPARISON_P1_23_POLICY_ID);
  });
});
