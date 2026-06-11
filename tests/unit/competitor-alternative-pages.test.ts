import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCompetitorAlternativePages,
  formatCompetitorAlternativePagesAuditLines,
} from "@/lib/marketing/competitor-alternative-pages-audit";
import { getCompetitorAlternativeConfig } from "@/lib/marketing/competitor-alternative-pages-content";
import {
  COMPETITOR_ALTERNATIVE_PAGES,
  COMPETITOR_ALTERNATIVE_PAGES_CI_WORKFLOW,
  COMPETITOR_ALTERNATIVE_PAGES_DOC,
  COMPETITOR_ALTERNATIVE_PAGES_NPM_SCRIPT,
  COMPETITOR_ALTERNATIVE_PAGES_POLICY_ID,
  COMPETITOR_ALTERNATIVE_PAGES_UNIT_TEST,
} from "@/lib/marketing/competitor-alternative-pages-policy";

const ROOT = process.cwd();

describe("Competitor alternative pages (P1-80)", () => {
  it("locks policy id and five canonical alternative routes", () => {
    expect(COMPETITOR_ALTERNATIVE_PAGES_POLICY_ID).toBe(
      "competitor-alternative-pages-p1-80-v1",
    );
    expect(COMPETITOR_ALTERNATIVE_PAGES).toHaveLength(5);
    expect(COMPETITOR_ALTERNATIVE_PAGES.map((entry) => entry.path)).toEqual([
      "/toast-alternative",
      "/square-alternative",
      "/marketman-alternative",
      "/marginedge-alternative",
      "/restaurant365-alternative",
    ]);
  });

  it("passes full competitor alternative pages audit", () => {
    const summary = auditCompetitorAlternativePages(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.routesWired).toBe(true);
    expect(summary.contentWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.sitemapWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("maps each alternative to compare content", () => {
    for (const entry of COMPETITOR_ALTERNATIVE_PAGES) {
      const config = getCompetitorAlternativeConfig(entry.slug);
      expect(config.path).toBe(entry.path);
      expect(config.compareSlug).toBe(entry.compareSlug);
      expect(config.metaTitle.toLowerCase()).toContain("alternative");
    }
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, COMPETITOR_ALTERNATIVE_PAGES_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMPETITOR_ALTERNATIVE_PAGES_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMPETITOR_ALTERNATIVE_PAGES_NPM_SCRIPT]).toContain(
      "audit-competitor-alternative-pages.ts",
    );
    expect(pkg.scripts?.["test:ci:competitor-alternative-pages"]).toContain(
      COMPETITOR_ALTERNATIVE_PAGES_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, COMPETITOR_ALTERNATIVE_PAGES_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:competitor-alternative-pages");
  });

  it("formats audit lines", () => {
    const summary = auditCompetitorAlternativePages(ROOT);
    const lines = formatCompetitorAlternativePagesAuditLines(summary);
    expect(lines.some((line) => line.includes(COMPETITOR_ALTERNATIVE_PAGES_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
