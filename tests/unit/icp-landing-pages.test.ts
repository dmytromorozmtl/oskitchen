import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditIcpLandingPages,
  formatIcpLandingPagesAuditLines,
} from "@/lib/marketing/icp-landing-pages-audit";
import {
  COMMISSARY_SOFTWARE_ICP_PATH,
  GHOST_KITCHEN_SOFTWARE_ICP_PATH,
  ICP_LANDING_PAGES_CI_WORKFLOW,
  ICP_LANDING_PAGES_DOC,
  ICP_LANDING_PAGES_NPM_SCRIPT,
  ICP_LANDING_PAGES_POLICY_ID,
  ICP_LANDING_PAGES_UNIT_TEST,
  ICP_LANDING_PAGE_ENTRIES,
  MEAL_PREP_SOFTWARE_ICP_PATH,
} from "@/lib/marketing/icp-landing-pages-policy";

const ROOT = process.cwd();

describe("ICP landing pages (P1-79)", () => {
  it("locks policy id and three canonical ICP paths", () => {
    expect(ICP_LANDING_PAGES_POLICY_ID).toBe("icp-landing-pages-p1-79-v1");
    expect(ICP_LANDING_PAGE_ENTRIES).toHaveLength(3);
    expect(MEAL_PREP_SOFTWARE_ICP_PATH).toBe("/meal-prep-software");
    expect(GHOST_KITCHEN_SOFTWARE_ICP_PATH).toBe("/ghost-kitchen-software");
    expect(COMMISSARY_SOFTWARE_ICP_PATH).toBe("/commissary-software");
  });

  it("passes full ICP landing pages audit", () => {
    const summary = auditIcpLandingPages(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.routesWired).toBe(true);
    expect(summary.contentPathsWired).toBe(true);
    expect(summary.legacyRedirectsWired).toBe(true);
    expect(summary.sitemapWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships landing components with test ids", () => {
    for (const entry of ICP_LANDING_PAGE_ENTRIES) {
      const source = readFileSync(join(ROOT, entry.componentPath), "utf8");
      expect(source).toContain(entry.testId);
    }
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, ICP_LANDING_PAGES_DOC))).toBe(true);
    expect(existsSync(join(ROOT, ICP_LANDING_PAGES_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ICP_LANDING_PAGES_NPM_SCRIPT]).toContain("audit-icp-landing-pages.ts");
    expect(pkg.scripts?.["test:ci:icp-landing-pages"]).toContain(ICP_LANDING_PAGES_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, ICP_LANDING_PAGES_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:icp-landing-pages");
  });

  it("formats audit lines", () => {
    const summary = auditIcpLandingPages(ROOT);
    const lines = formatIcpLandingPagesAuditLines(summary);
    expect(lines.some((line) => line.includes(ICP_LANDING_PAGES_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
