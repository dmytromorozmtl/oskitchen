import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { blogPostBySlug } from "@/lib/marketing/blog-posts";
import {
  auditSeoBlogArticlesP255,
  formatSeoBlogArticlesP255AuditLines,
} from "@/lib/marketing/seo-blog-articles-p2-55-audit";
import {
  SEO_BLOG_ARTICLES_P2_55_ARTIFACT,
  SEO_BLOG_ARTICLES_P2_55_CHECK_NPM_SCRIPT,
  SEO_BLOG_ARTICLES_P2_55_CI_NPM_SCRIPT,
  SEO_BLOG_ARTICLES_P2_55_CI_WORKFLOW,
  SEO_BLOG_ARTICLES_P2_55_DOC,
  SEO_BLOG_ARTICLES_P2_55_ICP_TOPICS,
  SEO_BLOG_ARTICLES_P2_55_POLICY_ID,
  SEO_BLOG_ARTICLES_P2_55_POSTS,
  SEO_BLOG_ARTICLES_P2_55_POST_COUNT,
  SEO_BLOG_ARTICLES_P2_55_UNIT_TEST,
  SEO_BLOG_ARTICLES_P2_55_WIRING_PATHS,
} from "@/lib/marketing/seo-blog-articles-p2-55-policy";

const ROOT = process.cwd();

describe("SEO blog articles (P2-55)", () => {
  it("locks policy id and five ICP-targeted posts", () => {
    expect(SEO_BLOG_ARTICLES_P2_55_POLICY_ID).toBe("seo-blog-articles-p2-55-v1");
    expect(SEO_BLOG_ARTICLES_P2_55_POSTS).toHaveLength(SEO_BLOG_ARTICLES_P2_55_POST_COUNT);
    expect(SEO_BLOG_ARTICLES_P2_55_ICP_TOPICS).toEqual([
      "meal_prep",
      "ghost_kitchen",
      "restaurant_pos",
    ]);
    expect(SEO_BLOG_ARTICLES_P2_55_POSTS.filter((p) => p.icpTopic === "meal_prep")).toHaveLength(2);
    expect(SEO_BLOG_ARTICLES_P2_55_POSTS.filter((p) => p.icpTopic === "ghost_kitchen")).toHaveLength(
      2,
    );
    expect(
      SEO_BLOG_ARTICLES_P2_55_POSTS.filter((p) => p.icpTopic === "restaurant_pos"),
    ).toHaveLength(1);
  });

  it("registers blog metadata for each P2-55 slug", () => {
    for (const post of SEO_BLOG_ARTICLES_P2_55_POSTS) {
      const meta = blogPostBySlug(post.slug);
      expect(meta?.title.length).toBeGreaterThan(10);
      expect(meta?.description.length).toBeGreaterThan(20);
    }
  });

  it("passes full P2-55 SEO blog articles audit", () => {
    const summary = auditSeoBlogArticlesP255(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.blogRegistryWired).toBe(true);
    expect(summary.pagesWired).toBe(true);
    expect(summary.contentWired).toBe(true);
    expect(summary.icpCoverageComplete).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-55 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SEO_BLOG_ARTICLES_P2_55_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SEO_BLOG_ARTICLES_P2_55_CHECK_NPM_SCRIPT]).toContain(
      SEO_BLOG_ARTICLES_P2_55_UNIT_TEST,
    );
    expect(pkg.scripts?.[SEO_BLOG_ARTICLES_P2_55_CI_NPM_SCRIPT]).toContain(
      SEO_BLOG_ARTICLES_P2_55_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, SEO_BLOG_ARTICLES_P2_55_CI_WORKFLOW), "utf8");
    expect(ci).toContain(SEO_BLOG_ARTICLES_P2_55_CHECK_NPM_SCRIPT);

    const doc = readFileSync(join(ROOT, SEO_BLOG_ARTICLES_P2_55_DOC), "utf8");
    expect(doc).toContain(SEO_BLOG_ARTICLES_P2_55_POLICY_ID);

    const artifact = JSON.parse(readFileSync(join(ROOT, SEO_BLOG_ARTICLES_P2_55_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(SEO_BLOG_ARTICLES_P2_55_POLICY_ID);
    expect(artifact.postCount).toBe(5);
  });

  it("formats audit lines", () => {
    const summary = auditSeoBlogArticlesP255(ROOT);
    const lines = formatSeoBlogArticlesP255AuditLines(summary);
    expect(lines.some((line) => line.includes(SEO_BLOG_ARTICLES_P2_55_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
