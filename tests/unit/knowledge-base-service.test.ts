import { describe, expect, it } from "vitest";

import {
  getKbArticle,
  getKbBreadcrumbs,
  getRelatedArticles,
  localizedText,
  resolveKbLocale,
  searchKbArticles,
} from "@/services/kb/knowledge-base-service";

describe("knowledge base service", () => {
  it("resolves locale with english fallback", () => {
    expect(resolveKbLocale("fr")).toBe("fr");
    expect(resolveKbLocale("de")).toBe("en");
  });

  it("returns article and breadcrumbs for nested slug", () => {
    const article = getKbArticle("getting-started/quick-start", "en");
    expect(article).not.toBeNull();
    expect(localizedText(article!.title, "en")).toContain("Quick Start");

    const crumbs = getKbBreadcrumbs("getting-started/quick-start", "en");
    expect(crumbs.at(-1)?.label).toContain("Quick Start");
    expect(crumbs[0]?.href).toBe("/kb");
  });

  it("searches articles by tag and title", () => {
    const results = searchKbArticles("invoice scanner", "en");
    expect(results.some((r) => r.slug === "inventory-finance/invoice-scanner")).toBe(true);
  });

  it("returns related articles for an article slug", () => {
    const related = getRelatedArticles("getting-started/quick-start", "en");
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((r) => r.slug !== "getting-started/quick-start")).toBe(true);
  });
});
