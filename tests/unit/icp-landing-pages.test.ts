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
  ICP_PILOT_HIGHLIGHTS_CHECK_NPM_SCRIPT,
  ICP_PILOT_HIGHLIGHTS_LANDING_IDS,
  ICP_PILOT_HIGHLIGHTS_POLICY_ID,
  MEAL_PREP_SOFTWARE_ICP_PATH,
} from "@/lib/marketing/icp-landing-pages-policy";
import {
  ICP_PILOT_HIGHLIGHTS,
  ICP_PILOT_HIGHLIGHTS_SECTION_TEST_ID,
  ICP_PILOT_LIVE_INTEGRATION_COUNT,
} from "@/lib/marketing/icp-pilot-highlights-content";

const ROOT = process.cwd();

describe("ICP landing pages (P1-79 + P1-23 pilot highlights)", () => {
  it("locks policy ids and three canonical ICP paths", () => {
    expect(ICP_LANDING_PAGES_POLICY_ID).toBe("icp-landing-pages-p1-79-v1");
    expect(ICP_PILOT_HIGHLIGHTS_POLICY_ID).toBe("icp-pilot-highlights-p1-23-v1");
    expect(ICP_LANDING_PAGE_ENTRIES).toHaveLength(3);
    expect(MEAL_PREP_SOFTWARE_ICP_PATH).toBe("/meal-prep-software");
    expect(GHOST_KITCHEN_SOFTWARE_ICP_PATH).toBe("/ghost-kitchen-software");
    expect(COMMISSARY_SOFTWARE_ICP_PATH).toBe("/commissary-kitchen-software");
    expect(ICP_PILOT_HIGHLIGHTS_LANDING_IDS).toEqual(["meal-prep", "ghost-kitchen"]);
    expect(ICP_PILOT_LIVE_INTEGRATION_COUNT).toBe(18);
    expect(ICP_PILOT_HIGHLIGHTS).toHaveLength(3);
  });

  it("passes full ICP landing pages audit including pilot highlights", () => {
    const summary = auditIcpLandingPages(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.routesWired).toBe(true);
    expect(summary.contentPathsWired).toBe(true);
    expect(summary.legacyRedirectsWired).toBe(true);
    expect(summary.sitemapWired).toBe(true);
    expect(summary.pilotHighlightsWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships landing components with test ids and pilot highlights on meal prep + ghost kitchen", () => {
    for (const entry of ICP_LANDING_PAGE_ENTRIES) {
      const source = readFileSync(join(ROOT, entry.componentPath), "utf8");
      expect(source).toContain(entry.testId);
      if ((ICP_PILOT_HIGHLIGHTS_LANDING_IDS as readonly string[]).includes(entry.id)) {
        expect(source).toContain("IcpPilotHighlightsSection");
        expect(source).toContain(ICP_PILOT_HIGHLIGHTS_SECTION_TEST_ID);
      }
    }
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, ICP_LANDING_PAGES_DOC))).toBe(true);
    expect(existsSync(join(ROOT, ICP_LANDING_PAGES_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[ICP_LANDING_PAGES_NPM_SCRIPT]).toContain("audit-icp-landing-pages.ts");
    expect(pkg.scripts?.[ICP_PILOT_HIGHLIGHTS_CHECK_NPM_SCRIPT]).toContain(
      ICP_LANDING_PAGES_UNIT_TEST,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:icp-landing-pages"]).toContain(ICP_LANDING_PAGES_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, ICP_LANDING_PAGES_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("icp-landing-pages");
  });

  it("formats audit lines", () => {
    const summary = auditIcpLandingPages(ROOT);
    const lines = formatIcpLandingPagesAuditLines(summary);
    expect(lines.some((line) => line.includes(ICP_LANDING_PAGES_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes(ICP_PILOT_HIGHLIGHTS_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
