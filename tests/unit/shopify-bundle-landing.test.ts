import { describe, expect, it } from "vitest";

import {
  SHOPIFY_BUNDLE_BADGE,
  SHOPIFY_BUNDLE_COMPARISON,
  SHOPIFY_BUNDLE_CTA,
  SHOPIFY_BUNDLE_FAQ,
  SHOPIFY_BUNDLE_FEATURES,
  SHOPIFY_AI_MOATS_BLOCK,
  SHOPIFY_MARKETPLACE_BLOCK,
  SHOPIFY_BUNDLE_HEADLINE,
  SHOPIFY_BUNDLE_SUBHEADLINE,
  SHOPIFY_BUNDLE_TESTIMONIAL,
  SHOPIFY_BUNDLE_TRUST_LINE,
  SHOPIFY_PAIN_POINTS,
  SHOPIFY_SOLUTION_POINTS,
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
      SHOPIFY_BUNDLE_CTA.title,
      SHOPIFY_BUNDLE_CTA.subtitle,
      SHOPIFY_BUNDLE_TESTIMONIAL.quote,
      SHOPIFY_BUNDLE_TESTIMONIAL.context,
      ...SHOPIFY_BUNDLE_FEATURES.map((f) => `${f.title} ${f.description}`),
      ...SHOPIFY_PAIN_POINTS.map((p) => `${p.title} ${p.description}`),
      ...SHOPIFY_SOLUTION_POINTS.map((p) => `${p.title} ${p.description}`),
      ...SHOPIFY_BUNDLE_FAQ.map((f) => `${f.q} ${f.a}`),
      ...SHOPIFY_BUNDLE_COMPARISON.rows.map((r) => `${r.feature} ${r.kitchenos}`),
      ...SHOPIFY_AI_MOATS_BLOCK.items.map((i) => `${i.title} ${i.description}`),
      SHOPIFY_AI_MOATS_BLOCK.title,
      SHOPIFY_AI_MOATS_BLOCK.description,
      SHOPIFY_AI_MOATS_BLOCK.footnote,
      ...SHOPIFY_MARKETPLACE_BLOCK.items.map((i) => `${i.title} ${i.description}`),
      SHOPIFY_MARKETPLACE_BLOCK.title,
      SHOPIFY_MARKETPLACE_BLOCK.description,
      SHOPIFY_MARKETPLACE_BLOCK.footnote,
    ].join(" ");

    expect(scanMarketingText(copy, "shopify-bundle-landing")).toHaveLength(0);
  });
});
