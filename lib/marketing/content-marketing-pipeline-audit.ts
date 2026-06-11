import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { BLOG_POSTS } from "@/lib/marketing/blog-posts";
import {
  CONTENT_MARKETING_PIPELINE_BLOG_REGISTRY,
  CONTENT_MARKETING_PIPELINE_DOC,
  CONTENT_MARKETING_PIPELINE_HONESTY_MARKERS,
  CONTENT_MARKETING_PIPELINE_POLICY_ID,
  CONTENT_MARKETING_PIPELINE_POST_COUNT,
  CONTENT_MARKETING_PIPELINE_POSTS,
  CONTENT_MARKETING_PIPELINE_WIRING_PATHS,
} from "@/lib/marketing/content-marketing-pipeline-policy";

export type ContentMarketingPipelineAuditSummary = {
  policyId: typeof CONTENT_MARKETING_PIPELINE_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  postCountCorrect: boolean;
  blogRegistryWired: boolean;
  publishedPostsWired: boolean;
  sitemapWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditContentMarketingPipeline(
  root = process.cwd(),
): ContentMarketingPipelineAuditSummary {
  const wiringComplete = CONTENT_MARKETING_PIPELINE_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let blogRegistryWired = false;
  let publishedPostsWired = false;
  let sitemapWired = false;

  if (existsSync(join(root, CONTENT_MARKETING_PIPELINE_DOC))) {
    const source = readFileSync(join(root, CONTENT_MARKETING_PIPELINE_DOC), "utf8");
    docWired = CONTENT_MARKETING_PIPELINE_POSTS.every((post) => source.includes(post.slug));
  }

  if (existsSync(join(root, CONTENT_MARKETING_PIPELINE_BLOG_REGISTRY))) {
    const source = readFileSync(join(root, CONTENT_MARKETING_PIPELINE_BLOG_REGISTRY), "utf8");
    blogRegistryWired = CONTENT_MARKETING_PIPELINE_POSTS.every((post) =>
      source.includes(post.slug),
    );
  }

  publishedPostsWired = CONTENT_MARKETING_PIPELINE_POSTS.filter(
    (post) => post.status === "published",
  ).every((post) => {
    if (!existsSync(join(root, post.pagePath))) return false;
    if (!existsSync(join(root, post.contentPath))) return false;
    const pageSource = readFileSync(join(root, post.pagePath), "utf8");
    return pageSource.includes(post.slug) && pageSource.includes("BlogArticleShell");
  });

  const sitemapPath = "lib/marketing/sitemap-urls.ts";
  if (existsSync(join(root, sitemapPath))) {
    const source = readFileSync(join(root, sitemapPath), "utf8");
    sitemapWired = CONTENT_MARKETING_PIPELINE_POSTS.every((post) =>
      source.includes(post.targetPath),
    );
  }

  const combinedSources = [
    CONTENT_MARKETING_PIPELINE_DOC,
    ...CONTENT_MARKETING_PIPELINE_POSTS.map((post) => post.contentPath),
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = CONTENT_MARKETING_PIPELINE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const postCountCorrect =
    CONTENT_MARKETING_PIPELINE_POSTS.length === CONTENT_MARKETING_PIPELINE_POST_COUNT &&
    BLOG_POSTS.length === CONTENT_MARKETING_PIPELINE_POST_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    postCountCorrect &&
    blogRegistryWired &&
    publishedPostsWired &&
    sitemapWired &&
    honestyMarkersPresent;

  return {
    policyId: CONTENT_MARKETING_PIPELINE_POLICY_ID,
    wiringComplete,
    docWired,
    postCountCorrect,
    blogRegistryWired,
    publishedPostsWired,
    sitemapWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatContentMarketingPipelineAuditLines(
  summary: ContentMarketingPipelineAuditSummary,
): string[] {
  return [
    `Content marketing pipeline audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${CONTENT_MARKETING_PIPELINE_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Post count (${CONTENT_MARKETING_PIPELINE_POST_COUNT}): ${summary.postCountCorrect ? "yes" : "no"}`,
    `Blog registry: ${summary.blogRegistryWired ? "yes" : "no"}`,
    `Published posts wired: ${summary.publishedPostsWired ? "yes" : "no"}`,
    `Sitemap: ${summary.sitemapWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
