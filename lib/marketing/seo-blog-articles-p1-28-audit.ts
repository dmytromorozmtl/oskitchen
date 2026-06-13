import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { blogPostBySlug } from "@/lib/marketing/blog-posts";
import {
  SEO_BLOG_ARTICLES_P1_28_DOC,
  SEO_BLOG_ARTICLES_P1_28_HONESTY_MARKERS,
  SEO_BLOG_ARTICLES_P1_28_POLICY_ID,
  SEO_BLOG_ARTICLES_P1_28_POSTS,
  SEO_BLOG_ARTICLES_P1_28_POST_COUNT,
  SEO_BLOG_ARTICLES_P1_28_WIRING_PATHS,
} from "@/lib/marketing/seo-blog-articles-p1-28-policy";

export type SeoBlogArticlesP128AuditSummary = {
  policyId: typeof SEO_BLOG_ARTICLES_P1_28_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  blogRegistryWired: boolean;
  pagesWired: boolean;
  contentWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditSeoBlogArticlesP128(root = process.cwd()): SeoBlogArticlesP128AuditSummary {
  const wiringComplete = SEO_BLOG_ARTICLES_P1_28_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, SEO_BLOG_ARTICLES_P1_28_DOC))) {
    const source = readFileSync(join(root, SEO_BLOG_ARTICLES_P1_28_DOC), "utf8");
    docWired =
      source.includes(SEO_BLOG_ARTICLES_P1_28_POLICY_ID) &&
      SEO_BLOG_ARTICLES_P1_28_POSTS.every(
        (post) => source.includes(post.primaryKeyword) && source.includes(post.targetPath),
      );
  }

  let blogRegistryWired = false;
  const blogPostsPath = "lib/marketing/blog-posts.ts";
  if (existsSync(join(root, blogPostsPath))) {
    blogRegistryWired = SEO_BLOG_ARTICLES_P1_28_POSTS.every((post) => {
      const meta = blogPostBySlug(post.slug);
      return meta !== undefined && meta.title.length > 0 && meta.description.length > 0;
    });
  }

  const pagesWired = SEO_BLOG_ARTICLES_P1_28_POSTS.every((post) => {
    if (!existsSync(join(root, post.pagePath))) return false;
    const source = readFileSync(join(root, post.pagePath), "utf8");
    return (
      source.includes("BlogArticleShell") &&
      source.includes(post.contentExport) &&
      source.includes(post.slug)
    );
  });

  const contentWired = SEO_BLOG_ARTICLES_P1_28_POSTS.every((post) => {
    if (!existsSync(join(root, post.contentPath))) return false;
    const source = readFileSync(join(root, post.contentPath), "utf8");
    return (
      source.includes(`export function ${post.contentExport}`) &&
      source.toLowerCase().includes(post.primaryKeyword.split(" ")[0]!)
    );
  });

  const combinedSources = SEO_BLOG_ARTICLES_P1_28_POSTS.map((post) => post.contentPath)
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = SEO_BLOG_ARTICLES_P1_28_HONESTY_MARKERS.some((marker) =>
    combinedSources.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    blogRegistryWired &&
    pagesWired &&
    contentWired &&
    honestyMarkersPresent &&
    SEO_BLOG_ARTICLES_P1_28_POSTS.length === SEO_BLOG_ARTICLES_P1_28_POST_COUNT;

  return {
    policyId: SEO_BLOG_ARTICLES_P1_28_POLICY_ID,
    wiringComplete,
    docWired,
    blogRegistryWired,
    pagesWired,
    contentWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatSeoBlogArticlesP128AuditLines(
  summary: SeoBlogArticlesP128AuditSummary,
): string[] {
  return [
    `SEO blog articles audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${SEO_BLOG_ARTICLES_P1_28_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Blog registry (${SEO_BLOG_ARTICLES_P1_28_POST_COUNT} posts): ${summary.blogRegistryWired ? "yes" : "no"}`,
    `Pages wired: ${summary.pagesWired ? "yes" : "no"}`,
    `Content modules: ${summary.contentWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
