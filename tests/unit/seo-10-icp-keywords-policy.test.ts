import { describe, expect, it } from "vitest";

import {
  auditSeo10IcpKeywordsDoc,
  getSeo10IcpKeywordById,
  lintSeo10IcpKeywordsCopy,
  listSeo10IcpPrimaryKeywords,
  SEO_10_ICP_KEYWORDS,
  SEO_10_ICP_KEYWORDS_POLICY_ID,
} from "@/lib/marketing/seo-10-icp-keywords-policy";

describe("SEO 10 ICP keywords policy (MKT-20)", () => {
  it("locks MKT-20 policy id and exactly ten primary keywords", () => {
    expect(SEO_10_ICP_KEYWORDS_POLICY_ID).toBe("seo-10-icp-keywords-mkt20-v1");
    expect(SEO_10_ICP_KEYWORDS).toHaveLength(10);
    expect(listSeo10IcpPrimaryKeywords()).toContain("ghost kitchen software");
    expect(listSeo10IcpPrimaryKeywords()).toContain("meal prep software");
  });

  it("maps P0 ICP segments to target landing paths", () => {
    const ghost = getSeo10IcpKeywordById("ghost-kitchen-software");
    expect(ghost?.targetPath).toBe("/solutions/ghost-kitchens");
    expect(ghost?.icpSegment).toBe("ghost_kitchen");

    const commissary = getSeo10IcpKeywordById("commissary-kitchen-software");
    expect(commissary?.icpSegment).toBe("commissary");

    const shopify = getSeo10IcpKeywordById("shopify-meal-prep-software");
    expect(shopify?.targetPath).toBe("/shopify");
  });

  it("passes audit on canonical SEO ICP keywords doc", () => {
    const audit = auditSeo10IcpKeywordsDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.keywordCount).toBe(10);
  });

  it("flags forbidden SEO superlatives and integration overclaims", () => {
    const result = lintSeo10IcpKeywordsCopy(
      "#1 restaurant software — Uber Eats official partner with guaranteed ROI and SOC 2 certified POS.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest ICP keyword meta copy", () => {
    const result = lintSeo10IcpKeywordsCopy(
      "Ghost kitchen software for multi-brand operators — order hub, KDS, and BETA integration labels.",
    );
    expect(result.passed).toBe(true);
  });
});
