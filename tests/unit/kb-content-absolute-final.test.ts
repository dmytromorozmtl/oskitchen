import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditKbContentAbsoluteFinal,
  auditKbIntegrationGuideDoc,
  auditKbQuickStartGuideDoc,
  KB_CONTENT_ABSOLUTE_FINAL_POLICY_ID,
  KB_INTEGRATION_ARTICLE_SLUGS,
  KB_INTEGRATION_SETUP_GUIDES,
  KB_QUICK_START_ARTICLE_SLUG,
  KB_QUICK_START_GUIDE_DOC,
  KB_QUICK_START_REQUIRED_HEADINGS,
  countKbArticles,
} from "@/lib/kb/kb-content-absolute-final-policy";

const ROOT = process.cwd();

describe("KB content absolute final (Task 34)", () => {
  it("locks policy id and integration guide paths", () => {
    expect(KB_CONTENT_ABSOLUTE_FINAL_POLICY_ID).toBe("kb-content-absolute-final-v1");
    expect(KB_INTEGRATION_SETUP_GUIDES).toHaveLength(4);
    expect(KB_INTEGRATION_ARTICLE_SLUGS).toEqual([
      "integrations/woocommerce",
      "integrations/shopify",
      "integrations/stripe-connect",
      "integrations/marketplaces",
    ]);
  });

  it("passes full KB content audit from repo root", () => {
    const audit = auditKbContentAbsoluteFinal();
    expect(audit.missingQuickStartHeadings, audit.missingQuickStartHeadings.join("; ")).toEqual(
      [],
    );
    expect(audit.missingIntegrationGuides).toEqual([]);
    expect(audit.integrationGuideSectionGaps).toEqual([]);
    expect(audit.quickStartArticlePresent).toBe(true);
    expect(audit.integrationArticleCount).toBe(4);
    expect(audit.passed).toBe(true);
  });

  it("includes all Quick Start guide headings", () => {
    const source = readFileSync(join(ROOT, KB_QUICK_START_GUIDE_DOC), "utf8");
    expect(auditKbQuickStartGuideDoc(source)).toEqual([]);
    for (const heading of KB_QUICK_START_REQUIRED_HEADINGS) {
      expect(source).toContain(heading);
    }
  });

  it("includes integration guide sections in all four setup docs", () => {
    for (const guidePath of KB_INTEGRATION_SETUP_GUIDES) {
      const source = readFileSync(join(ROOT, guidePath), "utf8");
      expect(auditKbIntegrationGuideDoc(source), guidePath).toEqual([]);
    }
  });

  it("registers Quick Start and four integration articles in KB_ARTICLES", () => {
    expect(countKbArticles()).toBeGreaterThanOrEqual(15);
    const audit = auditKbContentAbsoluteFinal();
    expect(audit.quickStartArticlePresent).toBe(true);
    expect(KB_QUICK_START_ARTICLE_SLUG).toBe("getting-started/quick-start");
  });
});
