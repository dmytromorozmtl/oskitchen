import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FOUNDER_STORY_BLOG_P3_68_CONTENT,
  FOUNDER_STORY_BLOG_P3_68_HONESTY_MARKERS,
  FOUNDER_STORY_BLOG_P3_68_PAGE,
  FOUNDER_STORY_BLOG_P3_68_REQUIRED_SECTIONS,
  FOUNDER_STORY_BLOG_P3_68_SLUG,
  FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC,
} from "@/lib/marketing/founder-story-blog-p3-68-policy";

export type FounderStoryBlogContractValidation = {
  passed: boolean;
  blogPageWired: boolean;
  blogContentWired: boolean;
  blogIndexWired: boolean;
  sectionsPresent: boolean;
  honestyMarkersOk: boolean;
  upstreamDocOk: boolean;
  failures: string[];
};

export function validateFounderStoryBlogContract(
  root = process.cwd(),
): FounderStoryBlogContractValidation {
  const failures: string[] = [];

  const pagePath = join(root, FOUNDER_STORY_BLOG_P3_68_PAGE);
  const contentPath = join(root, FOUNDER_STORY_BLOG_P3_68_CONTENT);
  const blogPostsPath = join(root, "lib/marketing/blog-posts.ts");

  const blogPageWired = existsSync(pagePath);
  if (!blogPageWired) {
    failures.push(`missing blog page: ${FOUNDER_STORY_BLOG_P3_68_PAGE}`);
  } else {
    const pageSource = readFileSync(pagePath, "utf8");
    if (!pageSource.includes(FOUNDER_STORY_BLOG_P3_68_SLUG)) {
      failures.push("blog page missing slug constant");
    }
    if (!pageSource.includes("WhyWeBuiltOsKitchenContent")) {
      failures.push("blog page missing content component import");
    }
  }

  const blogContentWired = existsSync(contentPath);
  let sectionsPresent = false;
  let honestyMarkersOk = false;

  if (!blogContentWired) {
    failures.push(`missing blog content: ${FOUNDER_STORY_BLOG_P3_68_CONTENT}`);
  } else {
    const contentSource = readFileSync(contentPath, "utf8");
    const missingSections = FOUNDER_STORY_BLOG_P3_68_REQUIRED_SECTIONS.filter(
      (section) => !contentSource.includes(section),
    );
    sectionsPresent = missingSections.length === 0;
    if (!sectionsPresent) {
      failures.push(`blog content missing sections: ${missingSections.join(", ")}`);
    }

    honestyMarkersOk = FOUNDER_STORY_BLOG_P3_68_HONESTY_MARKERS.every((marker) =>
      contentSource.includes(marker),
    );
    if (!honestyMarkersOk) {
      failures.push("blog content missing honesty markers");
    }

    if (!contentSource.includes("/book-demo")) {
      failures.push("blog content missing design partner CTA link");
    }
  }

  let blogIndexWired = false;
  if (!existsSync(blogPostsPath)) {
    failures.push("missing lib/marketing/blog-posts.ts");
  } else {
    const blogPosts = readFileSync(blogPostsPath, "utf8");
    blogIndexWired = blogPosts.includes(`slug: '${FOUNDER_STORY_BLOG_P3_68_SLUG}'`);
    if (!blogIndexWired) {
      failures.push(`blog-posts.ts missing slug: ${FOUNDER_STORY_BLOG_P3_68_SLUG}`);
    }
  }

  let upstreamDocOk = false;
  const upstreamPath = join(root, FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC);
  if (!existsSync(upstreamPath)) {
    failures.push(`missing upstream doc: ${FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC}`);
  } else {
    const upstream = readFileSync(upstreamPath, "utf8");
    upstreamDocOk =
      upstream.includes("founding-customer-story-v1") &&
      upstream.includes("Origin story") &&
      upstream.includes("Forbidden vs approved language");
    if (!upstreamDocOk) {
      failures.push("upstream founding-customer-story.md missing required sections");
    }
  }

  return {
    passed: failures.length === 0,
    blogPageWired,
    blogContentWired,
    blogIndexWired,
    sectionsPresent,
    honestyMarkersOk,
    upstreamDocOk,
    failures,
  };
}
