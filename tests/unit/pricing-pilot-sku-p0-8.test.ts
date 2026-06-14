import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DESIGN_PARTNER_LOI_SKU,
  DESIGN_PARTNER_PROGRAM_DURATION_DAYS,
  DESIGN_PARTNER_PROGRAM_HEADLINE,
  DESIGN_PARTNER_PROGRAM_NAME,
} from "@/lib/marketing/pilot-pricing-skus";
import {
  DESIGN_PARTNER_TIER_HEADLINE,
  DESIGN_PARTNER_TIER_NAME,
  DESIGN_PARTNER_TIER_PRICE_SUFFIX,
} from "@/lib/marketing/pricing-page-p1-30-content";
import {
  PRICING_PILOT_SKU_P0_8_DOC,
  PRICING_PILOT_SKU_P0_8_DURATION_DAYS,
  PRICING_PILOT_SKU_P0_8_HEADLINE,
  PRICING_PILOT_SKU_P0_8_POLICY_ID,
  PRICING_PILOT_SKU_P0_8_PROGRAM_NAME,
  PRICING_PILOT_SKU_P0_8_ROUTE,
  PRICING_PILOT_SKU_P0_8_SKU,
  PRICING_PILOT_SKU_P0_8_WIRING_PATHS,
} from "@/lib/marketing/pricing-pilot-sku-p0-8-policy";
import { PRICING_FAQ_ITEMS } from "@/lib/marketing/pricing-faq";

const ROOT = process.cwd();

describe("pricing page — Design Partner Program pilot SKU (P0-8)", () => {
  it("locks P0-8 policy, SKU, and 90-day program term", () => {
    expect(PRICING_PILOT_SKU_P0_8_POLICY_ID).toBe("p0-8-pricing-pilot-sku-v1");
    expect(PRICING_PILOT_SKU_P0_8_ROUTE).toBe("/pricing");
    expect(PRICING_PILOT_SKU_P0_8_SKU).toBe("LOI-DP-001");
    expect(PRICING_PILOT_SKU_P0_8_PROGRAM_NAME).toBe("Design Partner Program");
    expect(PRICING_PILOT_SKU_P0_8_HEADLINE).toBe(
      "Design Partner Program — free for 90 days",
    );
    expect(PRICING_PILOT_SKU_P0_8_DURATION_DAYS).toBe(90);
    expect(DESIGN_PARTNER_PROGRAM_NAME).toBe(PRICING_PILOT_SKU_P0_8_PROGRAM_NAME);
    expect(DESIGN_PARTNER_PROGRAM_HEADLINE).toBe(PRICING_PILOT_SKU_P0_8_HEADLINE);
    expect(DESIGN_PARTNER_PROGRAM_DURATION_DAYS).toBe(90);
  });

  it("surfaces pilot SKU on pricing tier content", () => {
    expect(DESIGN_PARTNER_TIER_NAME).toBe("Design Partner Program");
    expect(DESIGN_PARTNER_TIER_HEADLINE).toBe(
      "Design Partner Program — free for 90 days",
    );
    expect(DESIGN_PARTNER_TIER_PRICE_SUFFIX).toBe("/ 90 days");
    expect(DESIGN_PARTNER_LOI_SKU.duration).toBe("90 days");
    expect(DESIGN_PARTNER_LOI_SKU.oneTimeLabel).toBe("Free for 90 days");
  });

  it("documents P0-8 pilot SKU and wires all paths", () => {
    expect(existsSync(join(ROOT, PRICING_PILOT_SKU_P0_8_DOC))).toBe(true);
    const doc = readFileSync(join(ROOT, PRICING_PILOT_SKU_P0_8_DOC), "utf8");
    expect(doc).toContain(PRICING_PILOT_SKU_P0_8_POLICY_ID);
    expect(doc).toContain("LOI-DP-001");
    expect(doc).toContain("free for 90 days");

    for (const rel of PRICING_PILOT_SKU_P0_8_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }
  });

  it("includes Design Partner Program in pricing FAQ and page metadata", () => {
    const faq = PRICING_FAQ_ITEMS.find((item) =>
      item.question.includes("Design Partner Program"),
    );
    expect(faq?.answer).toContain("90 days");
    expect(faq?.answer).toContain("LOI-DP-001");

    const page = readFileSync(join(ROOT, "app/pricing/page.tsx"), "utf8");
    expect(page).toContain("Design Partner Program");
    expect(page).toContain("free for 90 days");
  });
});
