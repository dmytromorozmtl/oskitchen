import { describe, expect, it } from "vitest";
import { StorefrontSectionType } from "@prisma/client";

import { normalizeSectionContent } from "@/lib/storefront/sections";

describe("normalizeSectionContent", () => {
  it("normalizes HERO section", () => {
    const r = normalizeSectionContent(StorefrontSectionType.HERO, {
      headline: "Hello",
      subheadline: "World",
    });
    expect(r?.headline).toBe("Hello");
  });

  it("requires body for TEXT_BLOCK", () => {
    expect(normalizeSectionContent(StorefrontSectionType.TEXT_BLOCK, { heading: "x" })).toBeNull();
    expect(
      normalizeSectionContent(StorefrontSectionType.TEXT_BLOCK, { body: "Paragraph" }),
    ).not.toBeNull();
  });

  it("normalizes CTA section", () => {
    const r = normalizeSectionContent(StorefrontSectionType.CTA, {
      buttonLabel: "Order",
      buttonHref: "/menu",
    });
    expect(r?.buttonLabel).toBe("Order");
  });
});
