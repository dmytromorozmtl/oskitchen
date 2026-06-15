import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  KB_ARTICLES,
  KB_ARTICLE_BY_SLUG,
} from "@/lib/kb/knowledge-base-content";

/**
 * Absolute Final Task 34 — public /kb Quick Start + four integration setup guides.
 *
 * @see docs/kb/quick-start-guide.md
 * @see docs/kb/integrations/
 * @see lib/kb/knowledge-base-content.ts
 */

export const KB_CONTENT_ABSOLUTE_FINAL_POLICY_ID =
  "kb-content-absolute-final-v1" as const;

export const KB_QUICK_START_GUIDE_DOC = "docs/kb/quick-start-guide.md" as const;

export const KB_INTEGRATION_SETUP_GUIDES = [
  "docs/kb/integrations/woocommerce-setup.md",
  "docs/kb/integrations/shopify-setup.md",
  "docs/kb/integrations/stripe-connect-setup.md",
  "docs/kb/integrations/delivery-marketplaces-setup.md",
] as const;

export const KB_QUICK_START_REQUIRED_HEADINGS = [
  "Quick Start guide",
  "15-minute setup",
  "Step 1 — Account and location",
  "Step 2 — First menu item",
  "Step 3 — First order",
  "Verify your setup",
  "Next steps",
] as const;

export const KB_INTEGRATION_GUIDE_REQUIRED_SECTIONS = [
  "Prerequisites",
  "Dashboard steps",
  "Webhooks",
  "Troubleshooting",
] as const;

export const KB_INTEGRATION_ARTICLE_SLUGS = [
  "integrations/woocommerce",
  "integrations/shopify",
  "integrations/stripe-connect",
  "integrations/marketplaces",
] as const;

export const KB_QUICK_START_ARTICLE_SLUG = "getting-started/quick-start" as const;

export const KB_CONTENT_CI_SCRIPTS = ["test:ci:kb-content-absolute-final"] as const;

export type KbContentAbsoluteFinalAudit = {
  policyId: typeof KB_CONTENT_ABSOLUTE_FINAL_POLICY_ID;
  missingQuickStartHeadings: string[];
  missingIntegrationGuides: string[];
  integrationGuideSectionGaps: string[];
  quickStartArticlePresent: boolean;
  integrationArticleCount: number;
  passed: boolean;
};

export function auditKbQuickStartGuideDoc(source: string): string[] {
  return KB_QUICK_START_REQUIRED_HEADINGS.filter((heading) => !source.includes(heading));
}

export function auditKbIntegrationGuideDoc(source: string): string[] {
  return KB_INTEGRATION_GUIDE_REQUIRED_SECTIONS.filter((section) => !source.includes(section));
}

export function auditKbContentAbsoluteFinal(root = process.cwd()): KbContentAbsoluteFinalAudit {
  const quickStartSource = readFileSync(join(root, KB_QUICK_START_GUIDE_DOC), "utf8");
  const missingQuickStartHeadings = auditKbQuickStartGuideDoc(quickStartSource);

  const missingIntegrationGuides = KB_INTEGRATION_SETUP_GUIDES.filter(
    (path) => !existsSync(join(root, path)),
  );

  const integrationGuideSectionGaps: string[] = [];
  for (const guidePath of KB_INTEGRATION_SETUP_GUIDES) {
    const fullPath = join(root, guidePath);
    if (!existsSync(fullPath)) continue;
    const source = readFileSync(fullPath, "utf8");
    for (const section of auditKbIntegrationGuideDoc(source)) {
      integrationGuideSectionGaps.push(`${guidePath}: missing ${section}`);
    }
  }

  const quickStartArticle = KB_ARTICLE_BY_SLUG.get(KB_QUICK_START_ARTICLE_SLUG);
  const quickStartArticlePresent = Boolean(
    quickStartArticle && localizedBodyMinLength(quickStartArticle.body.en) >= 400,
  );

  const integrationArticleCount = KB_INTEGRATION_ARTICLE_SLUGS.filter((slug) => {
    const article = KB_ARTICLE_BY_SLUG.get(slug);
    return article && localizedBodyMinLength(article.body.en) >= 200;
  }).length;

  return {
    policyId: KB_CONTENT_ABSOLUTE_FINAL_POLICY_ID,
    missingQuickStartHeadings,
    missingIntegrationGuides,
    integrationGuideSectionGaps,
    quickStartArticlePresent,
    integrationArticleCount,
    passed:
      missingQuickStartHeadings.length === 0 &&
      missingIntegrationGuides.length === 0 &&
      integrationGuideSectionGaps.length === 0 &&
      quickStartArticlePresent &&
      integrationArticleCount === KB_INTEGRATION_ARTICLE_SLUGS.length,
  };
}

function localizedBodyMinLength(body: string): number {
  return body.trim().length;
}

export function listKbIntegrationArticles() {
  return KB_INTEGRATION_ARTICLE_SLUGS.map((slug) => KB_ARTICLE_BY_SLUG.get(slug)).filter(Boolean);
}

export function countKbArticles(): number {
  return KB_ARTICLES.length;
}
