import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-20 — SEO 10 ICP keywords policy (canonical organic targets).
 *
 * @see docs/seo-10-icp-keywords.md
 * @see docs/icp-definition-final.md
 * @see docs/seo-audit.md
 */

export const SEO_10_ICP_KEYWORDS_POLICY_ID = "seo-10-icp-keywords-mkt20-v1" as const;

export const SEO_10_ICP_KEYWORDS_DOC = "docs/seo-10-icp-keywords.md" as const;

export type IcpSeoKeywordEntry = {
  id: string;
  primaryKeyword: string;
  icpSegment: "ghost_kitchen" | "commissary" | "meal_prep" | "cross_icp";
  searchIntent: "commercial" | "informational";
  targetPath: string;
  secondaryKeywords: readonly string[];
};

/** Ten canonical ICP keywords — one primary per P0 segment + cross-ICP ops terms. */
export const SEO_10_ICP_KEYWORDS: readonly IcpSeoKeywordEntry[] = [
  {
    id: "ghost-kitchen-software",
    primaryKeyword: "ghost kitchen software",
    icpSegment: "ghost_kitchen",
    searchIntent: "commercial",
    targetPath: "/solutions/ghost-kitchens",
    secondaryKeywords: [
      "virtual brand management",
      "multi brand restaurant software",
      "cloud kitchen operations",
    ],
  },
  {
    id: "meal-prep-software",
    primaryKeyword: "meal prep software",
    icpSegment: "meal_prep",
    searchIntent: "commercial",
    targetPath: "/meal-prep-software",
    secondaryKeywords: [
      "meal prep order management",
      "meal delivery software",
      "weekly meal prep platform",
    ],
  },
  {
    id: "commissary-kitchen-software",
    primaryKeyword: "commissary kitchen software",
    icpSegment: "commissary",
    searchIntent: "commercial",
    targetPath: "/commissary-kitchen-software",
    secondaryKeywords: [
      "shared kitchen software",
      "commissary production management",
      "multi-tenant kitchen ops",
    ],
  },
  {
    id: "weekly-meal-prep-software",
    primaryKeyword: "weekly meal prep software",
    icpSegment: "meal_prep",
    searchIntent: "commercial",
    targetPath: "/landing/weekly-preorder",
    secondaryKeywords: ["weekly menu software", "preorder cutoff software", "subscription meal prep"],
  },
  {
    id: "virtual-brand-kitchen-software",
    primaryKeyword: "virtual brand kitchen software",
    icpSegment: "ghost_kitchen",
    searchIntent: "commercial",
    targetPath: "/landing/ghost-kitchen",
    secondaryKeywords: ["delivery kitchen software", "virtual restaurant platform"],
  },
  {
    id: "shopify-meal-prep-software",
    primaryKeyword: "shopify meal prep software",
    icpSegment: "meal_prep",
    searchIntent: "commercial",
    targetPath: "/shopify",
    secondaryKeywords: ["shopify kitchen integration", "shopify food production software"],
  },
  {
    id: "kitchen-display-system-software",
    primaryKeyword: "kitchen display system software",
    icpSegment: "cross_icp",
    searchIntent: "commercial",
    targetPath: "/product",
    secondaryKeywords: ["KDS software", "kitchen screen software", "restaurant KDS"],
  },
  {
    id: "restaurant-order-management-software",
    primaryKeyword: "restaurant order management software",
    icpSegment: "cross_icp",
    searchIntent: "commercial",
    targetPath: "/product",
    secondaryKeywords: ["order hub software", "multi-channel order management", "restaurant order hub"],
  },
  {
    id: "food-production-planning-software",
    primaryKeyword: "food production planning software",
    icpSegment: "cross_icp",
    searchIntent: "informational",
    targetPath: "/resources/kitchen-production-planning",
    secondaryKeywords: ["kitchen production board", "batch prep software", "production planning restaurant"],
  },
  {
    id: "catering-production-software",
    primaryKeyword: "catering management software",
    icpSegment: "cross_icp",
    searchIntent: "commercial",
    targetPath: "/catering-management",
    secondaryKeywords: [
      "catering production software",
      "catering production workflow",
      "event catering kitchen software",
    ],
  },
] as const;

export const SEO_10_ICP_KEYWORDS_FORBIDDEN_PHRASES = [
  "#1 restaurant software",
  "best pos in america",
  "replace toast guaranteed",
  "trusted by thousands",
  "soc 2 certified pos",
  "uber eats official partner",
  "fully integrated doordash",
  "guaranteed roi",
] as const;

export const SEO_10_ICP_KEYWORDS_DOC_REQUIRED_HEADINGS = [
  "Ten canonical ICP keywords",
  "Keyword matrix",
  "Forbidden SEO phrases",
  "On-page checklist",
] as const;

export type Seo10IcpKeywordsDocAudit = {
  docPath: typeof SEO_10_ICP_KEYWORDS_DOC;
  missingHeadings: string[];
  keywordCount: number;
  passed: boolean;
};

export function listSeo10IcpPrimaryKeywords(): string[] {
  return SEO_10_ICP_KEYWORDS.map((entry) => entry.primaryKeyword);
}

export function getSeo10IcpKeywordById(id: string): IcpSeoKeywordEntry | undefined {
  return SEO_10_ICP_KEYWORDS.find((entry) => entry.id === id);
}

export function auditSeo10IcpKeywordsDoc(root = process.cwd()): Seo10IcpKeywordsDocAudit {
  const source = readFileSync(join(root, SEO_10_ICP_KEYWORDS_DOC), "utf8");
  const missingHeadings = SEO_10_ICP_KEYWORDS_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: SEO_10_ICP_KEYWORDS_DOC,
    missingHeadings,
    keywordCount: SEO_10_ICP_KEYWORDS.length,
    passed: missingHeadings.length === 0 && SEO_10_ICP_KEYWORDS.length === 10,
  };
}

export type Seo10IcpKeywordsLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintSeo10IcpKeywordsCopy(source: string): Seo10IcpKeywordsLint {
  const lower = source.toLowerCase();
  const forbiddenHits = SEO_10_ICP_KEYWORDS_FORBIDDEN_PHRASES.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
