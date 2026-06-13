import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPricingPageP130,
  formatPricingPageP130AuditLines,
} from "@/lib/marketing/pricing-page-p1-30-audit";
import {
  DESIGN_PARTNER_TIER_NAME,
  DESIGN_PARTNER_TIER_SKU,
} from "@/lib/marketing/pricing-page-p1-30-content";
import {
  PRICING_PAGE_P1_30_CHECK_NPM_SCRIPT,
  PRICING_PAGE_P1_30_DOC,
  PRICING_PAGE_P1_30_NPM_SCRIPT,
  PRICING_PAGE_P1_30_POLICY_ID,
  PRICING_PAGE_P1_30_ROUTE,
  PRICING_PAGE_P1_30_SKU,
  PRICING_PAGE_P1_30_TIER_TEST_ID,
  PRICING_PAGE_P1_30_UNIT_TEST,
} from "@/lib/marketing/pricing-page-p1-30-policy";

const ROOT = process.cwd();

describe("Pricing page — public Design Partner tier (P1-30)", () => {
  it("locks policy id, route, and Design Partner SKU", () => {
    expect(PRICING_PAGE_P1_30_POLICY_ID).toBe("pricing-page-p1-30-v1");
    expect(PRICING_PAGE_P1_30_ROUTE).toBe("/pricing");
    expect(PRICING_PAGE_P1_30_SKU).toBe("LOI-DP-001");
    expect(DESIGN_PARTNER_TIER_SKU).toBe(PRICING_PAGE_P1_30_SKU);
    expect(DESIGN_PARTNER_TIER_NAME).toBe("Design Partner");
  });

  it("passes full P1-30 pricing page audit", () => {
    const summary = auditPricingPageP130(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pricingPageWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.skuWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships Design Partner tier with public test id on pricing page", () => {
    const component = readFileSync(
      join(ROOT, "components/marketing/design-partner-pricing-tier.tsx"),
      "utf8",
    );
    const pricingPage = readFileSync(join(ROOT, "components/marketing/pricing-page.tsx"), "utf8");
    expect(component).toContain("DesignPartnerPricingTier");
    expect(component).toContain("PRICING_PAGE_P1_30_TIER_TEST_ID");
    expect(pricingPage).toContain("DesignPartnerPricingTier");
  });

  it("registers audit script and check npm wiring", () => {
    expect(existsSync(join(ROOT, PRICING_PAGE_P1_30_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PRICING_PAGE_P1_30_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PRICING_PAGE_P1_30_NPM_SCRIPT]).toContain("audit-pricing-page-p1-30.ts");
    expect(pkg.scripts?.[PRICING_PAGE_P1_30_CHECK_NPM_SCRIPT]).toContain(PRICING_PAGE_P1_30_UNIT_TEST);
  });

  it("formats audit lines", () => {
    const summary = auditPricingPageP130(ROOT);
    const lines = formatPricingPageP130AuditLines(summary);
    expect(lines.some((line) => line.includes(PRICING_PAGE_P1_30_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
