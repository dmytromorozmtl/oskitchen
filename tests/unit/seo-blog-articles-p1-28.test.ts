import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { blogPostBySlug } from "@/lib/marketing/blog-posts";
import {
  auditSeoBlogArticlesP128,
  formatSeoBlogArticlesP128AuditLines,
} from "@/lib/marketing/seo-blog-articles-p1-28-audit";
import {
  SEO_BLOG_ARTICLES_P1_28_CHECK_NPM_SCRIPT,
  SEO_BLOG_ARTICLES_P1_28_DOC,
  SEO_BLOG_ARTICLES_P1_28_NPM_SCRIPT,
  SEO_BLOG_ARTICLES_P1_28_POLICY_ID,
  SEO_BLOG_ARTICLES_P1_28_POSTS,
  SEO_BLOG_ARTICLES_P1_28_POST_COUNT,
  SEO_BLOG_ARTICLES_P1_28_UNIT_TEST,
} from "@/lib/marketing/seo-blog-articles-p1-28-policy";

const ROOT = process.cwd();

describe("SEO blog articles (P1-28)", () => {
  it("locks policy id and six keyword-targeted posts", () => {
    expect(SEO_BLOG_ARTICLES_P1_28_POLICY_ID).toBe("seo-blog-articles-p1-28-v1");
    expect(SEO_BLOG_ARTICLES_P1_28_POSTS).toHaveLength(SEO_BLOG_ARTICLES_P1_28_POST_COUNT);
    expect(SEO_BLOG_ARTICLES_P1_28_POSTS.map((p) => p.slug)).toContain(
      "ghost-kitchen-software-2026",
    );
    expect(SEO_BLOG_ARTICLES_P1_28_POSTS.map((p) => p.slug)).toContain(
      "meal-prep-subscription-management",
    );
    expect(SEO_BLOG_ARTICLES_P1_28_POSTS.map((p) => p.slug)).toContain(
      "restaurant-pos-integration-health",
    );
  });

  it("registers blog metadata for each P1-28 slug", () => {
    for (const post of SEO_BLOG_ARTICLES_P1_28_POSTS) {
      const meta = blogPostBySlug(post.slug);
      expect(meta?.title.length).toBeGreaterThan(10);
      expect(meta?.description.length).toBeGreaterThan(20);
    }
  });

  it("passes full P1-28 SEO blog articles audit", () => {
    const summary = auditSeoBlogArticlesP128(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.blogRegistryWired).toBe(true);
    expect(summary.pagesWired).toBe(true);
    expect(summary.contentWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script and check npm wiring", () => {
    expect(existsSync(join(ROOT, SEO_BLOG_ARTICLES_P1_28_DOC))).toBe(true);
    expect(existsSync(join(ROOT, SEO_BLOG_ARTICLES_P1_28_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SEO_BLOG_ARTICLES_P1_28_NPM_SCRIPT]).toContain(
      "audit-seo-blog-articles-p1-28.ts",
    );
    expect(pkg.scripts?.[SEO_BLOG_ARTICLES_P1_28_CHECK_NPM_SCRIPT]).toContain(
      SEO_BLOG_ARTICLES_P1_28_UNIT_TEST,
    );
  });

  it("formats audit lines", () => {
    const summary = auditSeoBlogArticlesP128(ROOT);
    const lines = formatSeoBlogArticlesP128AuditLines(summary);
    expect(lines.some((line) => line.includes(SEO_BLOG_ARTICLES_P1_28_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
