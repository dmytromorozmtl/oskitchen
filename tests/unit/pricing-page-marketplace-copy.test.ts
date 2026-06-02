import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { VENDOR_PLAN_ORDER } from "@/lib/marketplace/billing-integration-types";
import { PRICING_FAQ_ITEMS } from "@/lib/marketing/pricing-faq";

const PRICING_PAGE_PATH = join(process.cwd(), "components/marketing/pricing-page.tsx");

describe("pricing page marketplace copy", () => {
  it("includes marketplace section with vendor tiers from billing registry", () => {
    const page = readFileSync(PRICING_PAGE_PATH, "utf8");
    expect(page).toContain("marketplace-pricing-heading");
    expect(page).toContain("HoReCa B2B marketplace");
    expect(page).toContain("no separate buyer marketplace fee");
    expect(page).toContain("commissionRateForPlan");
    expect(page).toContain("VENDOR_PLAN_ORDER");
    expect(page).toContain('href="/vendor"');
    expect(page).toContain("BETA");
    for (const tier of VENDOR_PLAN_ORDER) {
      expect(page).toContain("commissionRateForPlan(tier)");
    }
  });

  it("includes matching marketplace FAQ entries", () => {
    const questions = PRICING_FAQ_ITEMS.map((item) => item.question);
    expect(questions).toContain("Does the HoReCa marketplace cost restaurants extra?");
    expect(questions).toContain("How do marketplace vendor fees work?");
    expect(questions).toContain("Is the B2B marketplace live?");
    const vendorFaq = PRICING_FAQ_ITEMS.find((item) =>
      item.question.includes("vendor fees"),
    );
    expect(vendorFaq?.answer).toContain("5%");
    expect(vendorFaq?.answer).toContain("BETA");
  });
});
