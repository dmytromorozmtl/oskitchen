import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { comparePageBySlug } from "@/lib/marketing/compare-content";
import {
  auditCompetitorComparisonPagesP127,
  formatCompetitorComparisonPagesP127AuditLines,
} from "@/lib/marketing/competitor-comparison-pages-p1-27-audit";
import {
  COMPETITOR_COMPARISON_P1_27_ENTRIES,
  COMPETITOR_COMPARISON_PAGES_P1_27_CHECK_NPM_SCRIPT,
  COMPETITOR_COMPARISON_PAGES_P1_27_DOC,
  COMPETITOR_COMPARISON_PAGES_P1_27_NPM_SCRIPT,
  COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID,
  COMPETITOR_COMPARISON_PAGES_P1_27_UNIT_TEST,
} from "@/lib/marketing/competitor-comparison-pages-p1-27-policy";

const ROOT = process.cwd();

describe("Competitor comparison pages — Toast, Square, Lightspeed (P1-27)", () => {
  it("locks policy id and three canonical compare routes", () => {
    expect(COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID).toBe(
      "competitor-comparison-pages-p1-27-v1",
    );
    expect(COMPETITOR_COMPARISON_P1_27_ENTRIES).toHaveLength(3);
    expect(COMPETITOR_COMPARISON_P1_27_ENTRIES.map((e) => e.path)).toEqual([
      "/compare/toast",
      "/compare/square",
      "/compare/lightspeed",
    ]);
  });

  it("ships honest compare content for each incumbent", () => {
    for (const entry of COMPETITOR_COMPARISON_P1_27_ENTRIES) {
      const page = comparePageBySlug(entry.slug);
      expect(page?.path).toBe(entry.path);
      expect(page?.whenToChoose.length).toBeGreaterThanOrEqual(2);
      expect(page?.disclaimer.toLowerCase()).toContain("not affiliated");
    }
    expect(comparePageBySlug("kitchenos-vs-lightspeed")?.path).toBe("/compare/lightspeed");
  });

  it("passes full P1-27 competitor comparison audit", () => {
    const summary = auditCompetitorComparisonPagesP127(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.compareContentWired).toBe(true);
    expect(summary.compareLandingWired).toBe(true);
    expect(summary.compareHubWired).toBe(true);
    expect(summary.positioningSectionsWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script and check npm wiring", () => {
    expect(existsSync(join(ROOT, COMPETITOR_COMPARISON_PAGES_P1_27_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMPETITOR_COMPARISON_PAGES_P1_27_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMPETITOR_COMPARISON_PAGES_P1_27_NPM_SCRIPT]).toContain(
      "audit-competitor-comparison-pages-p1-27.ts",
    );
    expect(pkg.scripts?.[COMPETITOR_COMPARISON_PAGES_P1_27_CHECK_NPM_SCRIPT]).toContain(
      COMPETITOR_COMPARISON_PAGES_P1_27_UNIT_TEST,
    );
  });

  it("formats audit lines", () => {
    const summary = auditCompetitorComparisonPagesP127(ROOT);
    const lines = formatCompetitorComparisonPagesP127AuditLines(summary);
    expect(lines.some((line) => line.includes(COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
