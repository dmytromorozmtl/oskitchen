import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarketplaceSeoPages,
  formatMarketplaceSeoPagesAuditLines,
} from "@/lib/marketing/marketplace-seo-pages-audit";
import { getMarketplaceSeoConfig } from "@/lib/marketing/marketplace-seo-pages-content";
import {
  FOOD_DISTRIBUTORS_SEO_PATH,
  MARKETPLACE_SEO_PAGES_CI_WORKFLOW,
  MARKETPLACE_SEO_PAGES_DOC,
  MARKETPLACE_SEO_PAGES_NPM_SCRIPT,
  MARKETPLACE_SEO_PAGES_POLICY_ID,
  MARKETPLACE_SEO_PAGES_UNIT_TEST,
  MARKETPLACE_SEO_PAGE_ENTRIES,
  RESTAURANT_MARKETPLACE_SEO_PATH,
  RESTAURANT_SUPPLIERS_SEO_PATH,
} from "@/lib/marketing/marketplace-seo-pages-policy";

const ROOT = process.cwd();

describe("Marketplace SEO pages (P2-125)", () => {
  it("locks policy id and three canonical SEO paths", () => {
    expect(MARKETPLACE_SEO_PAGES_POLICY_ID).toBe("marketplace-seo-pages-p2-125-v1");
    expect(MARKETPLACE_SEO_PAGE_ENTRIES).toHaveLength(3);
    expect(RESTAURANT_SUPPLIERS_SEO_PATH).toBe("/restaurant-suppliers");
    expect(FOOD_DISTRIBUTORS_SEO_PATH).toBe("/food-distributors");
    expect(RESTAURANT_MARKETPLACE_SEO_PATH).toBe("/restaurant-marketplace");
  });

  it("passes full marketplace SEO pages audit", () => {
    const summary = auditMarketplaceSeoPages(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.routesWired).toBe(true);
    expect(summary.contentWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.sitemapWired).toBe(true);
    expect(summary.legacyRoutesLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships SEO configs with keywords and BETA honesty", () => {
    const suppliers = getMarketplaceSeoConfig("restaurant-suppliers");
    expect(suppliers.keywords.length).toBeGreaterThan(2);
    expect(suppliers.heroSubtitle).toContain("BETA");
    expect(suppliers.faqs.length).toBeGreaterThan(0);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, MARKETPLACE_SEO_PAGES_DOC))).toBe(true);
    expect(existsSync(join(ROOT, MARKETPLACE_SEO_PAGES_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MARKETPLACE_SEO_PAGES_NPM_SCRIPT]).toContain(
      "audit-marketplace-seo-pages.ts",
    );
    expect(pkg.scripts?.["test:ci:marketplace-seo-pages"]).toContain(
      MARKETPLACE_SEO_PAGES_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_SEO_PAGES_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:marketplace-seo-pages");
  });

  it("formats audit lines", () => {
    const summary = auditMarketplaceSeoPages(ROOT);
    const lines = formatMarketplaceSeoPagesAuditLines(summary);
    expect(lines.some((line) => line.includes(MARKETPLACE_SEO_PAGES_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
