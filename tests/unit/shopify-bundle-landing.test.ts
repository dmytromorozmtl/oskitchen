import { describe, expect, it } from "vitest";

import {
  SHOPIFY_BUNDLE_BADGE,
  SHOPIFY_BUNDLE_FEATURES,
  SHOPIFY_BUNDLE_HEADLINE,
  SHOPIFY_BUNDLE_SUBHEADLINE,
  SHOPIFY_BUNDLE_TESTIMONIAL,
  SHOPIFY_BUNDLE_TRUST_LINE,
} from "@/lib/marketing/shopify-bundle-content";
import { scanMarketingText } from "@/lib/governance/marketing-claims-governance-policy";

describe("shopify bundle landing marketing copy", () => {
  it("exports expected hero labels", () => {
    expect(SHOPIFY_BUNDLE_BADGE).toBe("Shopify + Kitchen OS");
    expect(SHOPIFY_BUNDLE_HEADLINE).toContain("Shopify");
    expect(SHOPIFY_BUNDLE_SUBHEADLINE).toContain("Connect Shopify");
  });

  it("includes six feature cards", () => {
    expect(SHOPIFY_BUNDLE_FEATURES).toHaveLength(6);
  });

  it("labels testimonial as pilot feedback", () => {
    expect(SHOPIFY_BUNDLE_TESTIMONIAL.context.toLowerCase()).toContain("pilot");
  });

  it("passes marketing claims governance scan", () => {
    const copy = [
      SHOPIFY_BUNDLE_HEADLINE,
      SHOPIFY_BUNDLE_SUBHEADLINE,
      SHOPIFY_BUNDLE_TRUST_LINE,
      SHOPIFY_BUNDLE_TESTIMONIAL.quote,
      SHOPIFY_BUNDLE_TESTIMONIAL.context,
      ...SHOPIFY_BUNDLE_FEATURES.map((f) => `${f.title} ${f.description}`),
    ].join(" ");

    expect(scanMarketingText(copy, "shopify-bundle-landing")).toHaveLength(0);
  });
});
