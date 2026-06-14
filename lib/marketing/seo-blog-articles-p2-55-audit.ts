import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { blogPostBySlug } from "@/lib/marketing/blog-posts";
import {
  SEO_BLOG_ARTICLES_P2_55_DOC,
  SEO_BLOG_ARTICLES_P2_55_HONESTY_MARKERS,
  SEO_BLOG_ARTICLES_P2_55_ICP_TOPICS,
  SEO_BLOG_ARTICLES_P2_55_POLICY_ID,
  SEO_BLOG_ARTICLES_P2_55_POSTS,
  SEO_BLOG_ARTICLES_P2_55_POST_COUNT,
  SEO_BLOG_ARTICLES_P2_55_WIRING_PATHS,
  type SeoBlogArticleP255IcpTopic,
} from "@/lib/marketing/seo-blog-articles-p2-55-policy";

export type SeoBlogArticlesP255AuditSummary = {
  policyId: typeof SEO_BLOG_ARTICLES_P2_55_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  blogRegistryWired: boolean;
  pagesWired: boolean;
  contentWired: boolean;
  icpCoverageComplete: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

function icpTopicCounts(): Record<SeoBlogArticleP255IcpTopic, number> {
  const counts: Record<SeoBlogArticleP255IcpTopic, number> = {
    meal_prep: 0,
    ghost_kitchen: 0,
    restaurant_pos: 0,
  };
  for (const post of SEO_BLOG_ARTICLES_P2_55_POSTS) {
    counts[post.icpTopic] += 1;
  }
  return counts;
}

export function auditSeoBlogArticlesP255(root = process.cwd()): SeoBlogArticlesP255AuditSummary {
  const wiringComplete = SEO_BLOG_ARTICLES_P2_55_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, SEO_BLOG_ARTICLES_P2_55_DOC))) {
    const source = readFileSync(join(root, SEO_BLOG_ARTICLES_P2_55_DOC), "utf8");
    docWired =
      source.includes(SEO_BLOG_ARTICLES_P2_55_POLICY_ID) &&
      SEO_BLOG_ARTICLES_P2_55_POSTS.every(
        (post) => source.includes(post.primaryKeyword) && source.includes(post.targetPath),
      );
  }

  let blogRegistryWired = false;
  if (existsSync(join(root, "lib/marketing/blog-posts.ts"))) {
    blogRegistryWired = SEO_BLOG_ARTICLES_P2_55_POSTS.every((post) => {
      const meta = blogPostBySlug(post.slug);
      return meta !== undefined && meta.title.length > 10 && meta.description.length > 20;
    });
  }

  const pagesWired = SEO_BLOG_ARTICLES_P2_55_POSTS.every((post) => {
    if (!existsSync(join(root, post.pagePath))) return false;
    const source = readFileSync(join(root, post.pagePath), "utf8");
    return (
      source.includes("BlogArticleShell") &&
      source.includes(post.contentExport) &&
      source.includes(post.slug)
    );
  });

  const contentWired = SEO_BLOG_ARTICLES_P2_55_POSTS.every((post) => {
    if (!existsSync(join(root, post.contentPath))) return false;
    const source = readFileSync(join(root, post.contentPath), "utf8");
    return (
      source.includes(`export function ${post.contentExport}`) &&
      source.includes(post.icpLandingHint)
    );
  });

  const counts = icpTopicCounts();
  const icpCoverageComplete = SEO_BLOG_ARTICLES_P2_55_ICP_TOPICS.every(
    (topic) => counts[topic] >= 1,
  );

  const combinedSources = SEO_BLOG_ARTICLES_P2_55_POSTS.map((post) => post.contentPath)
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = SEO_BLOG_ARTICLES_P2_55_HONESTY_MARKERS.some((marker) =>
    combinedSources.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    blogRegistryWired &&
    pagesWired &&
    contentWired &&
    icpCoverageComplete &&
    honestyMarkersPresent &&
    SEO_BLOG_ARTICLES_P2_55_POSTS.length === SEO_BLOG_ARTICLES_P2_55_POST_COUNT &&
    counts.meal_prep >= 2 &&
    counts.ghost_kitchen >= 2 &&
    counts.restaurant_pos >= 1;

  return {
    policyId: SEO_BLOG_ARTICLES_P2_55_POLICY_ID,
    wiringComplete,
    docWired,
    blogRegistryWired,
    pagesWired,
    contentWired,
    icpCoverageComplete,
    honestyMarkersPresent,
    passed,
  };
}

export function formatSeoBlogArticlesP255AuditLines(
  summary: SeoBlogArticlesP255AuditSummary,
): string[] {
  const counts = icpTopicCounts();
  return [
    `SEO blog articles audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${SEO_BLOG_ARTICLES_P2_55_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Blog registry (${SEO_BLOG_ARTICLES_P2_55_POST_COUNT} posts): ${summary.blogRegistryWired ? "yes" : "no"}`,
    `Pages wired: ${summary.pagesWired ? "yes" : "no"}`,
    `Content modules: ${summary.contentWired ? "yes" : "no"}`,
    `ICP coverage: meal_prep=${counts.meal_prep} ghost_kitchen=${counts.ghost_kitchen} restaurant_pos=${counts.restaurant_pos}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
