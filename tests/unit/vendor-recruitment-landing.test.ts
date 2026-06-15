import { describe, expect, it } from "vitest";

import { scanMarketingText } from "@/lib/governance/marketing-claims-governance-policy";
import {
  VENDOR_RECRUITMENT_BADGE,
  VENDOR_RECRUITMENT_BENEFITS,
  VENDOR_RECRUITMENT_FAQ,
  VENDOR_RECRUITMENT_HEADLINE,
  VENDOR_RECRUITMENT_LIMITATIONS,
  VENDOR_RECRUITMENT_PAIN_POINTS,
  VENDOR_RECRUITMENT_STEPS,
  VENDOR_RECRUITMENT_SUBHEADLINE,
  VENDOR_RECRUITMENT_TRUST_LINE,
} from "@/lib/marketing/vendor-recruitment-content";

describe("vendor recruitment landing marketing copy", () => {
  it("exports expected hero labels", () => {
    expect(VENDOR_RECRUITMENT_BADGE).toContain("BETA");
    expect(VENDOR_RECRUITMENT_HEADLINE).toContain("marketplace");
    expect(VENDOR_RECRUITMENT_SUBHEADLINE).toContain("Stripe Connect");
  });

  it("includes five onboarding steps", () => {
    expect(VENDOR_RECRUITMENT_STEPS).toHaveLength(5);
  });

  it("passes marketing claims governance scan", () => {
    const copy = [
      VENDOR_RECRUITMENT_HEADLINE,
      VENDOR_RECRUITMENT_SUBHEADLINE,
      VENDOR_RECRUITMENT_TRUST_LINE,
      ...VENDOR_RECRUITMENT_PAIN_POINTS.map((p) => `${p.title} ${p.description}`),
      ...VENDOR_RECRUITMENT_BENEFITS.map((b) => `${b.title} ${b.description}`),
      ...VENDOR_RECRUITMENT_STEPS.map((s) => `${s.title} ${s.description}`),
      ...VENDOR_RECRUITMENT_LIMITATIONS,
      ...VENDOR_RECRUITMENT_FAQ.map((f) => `${f.q} ${f.a}`),
    ].join(" ");

    expect(scanMarketingText(copy, "vendor-recruitment-landing")).toHaveLength(0);
  });
});
