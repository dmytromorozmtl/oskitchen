import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { BLOG_POSTS } from "@/lib/marketing/blog-posts";
import {
  auditContentMarketingPipeline,
  formatContentMarketingPipelineAuditLines,
} from "@/lib/marketing/content-marketing-pipeline-audit";
import {
  CONTENT_MARKETING_PIPELINE_CI_WORKFLOW,
  CONTENT_MARKETING_PIPELINE_DOC,
  CONTENT_MARKETING_PIPELINE_NPM_SCRIPT,
  CONTENT_MARKETING_PIPELINE_POLICY_ID,
  CONTENT_MARKETING_PIPELINE_POST_COUNT,
  CONTENT_MARKETING_PIPELINE_POSTS,
  CONTENT_MARKETING_PIPELINE_UNIT_TEST,
} from "@/lib/marketing/content-marketing-pipeline-policy";

const ROOT = process.cwd();

describe("Content marketing pipeline (P1-81)", () => {
  it("locks policy id and seven-post pipeline", () => {
    expect(CONTENT_MARKETING_PIPELINE_POLICY_ID).toBe(
      "content-marketing-pipeline-p1-81-v1",
    );
    expect(CONTENT_MARKETING_PIPELINE_POST_COUNT).toBe(7);
    expect(CONTENT_MARKETING_PIPELINE_POSTS).toHaveLength(7);
    expect(BLOG_POSTS).toHaveLength(7);
  });

  it("passes full content marketing pipeline audit", () => {
    const summary = auditContentMarketingPipeline(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.postCountCorrect).toBe(true);
    expect(summary.blogRegistryWired).toBe(true);
    expect(summary.publishedPostsWired).toBe(true);
    expect(summary.sitemapWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("covers all three P0 ICP segments plus cross-ICP", () => {
    const segments = new Set(CONTENT_MARKETING_PIPELINE_POSTS.map((post) => post.icpSegment));
    expect(segments.has("meal_prep")).toBe(true);
    expect(segments.has("ghost_kitchen")).toBe(true);
    expect(segments.has("commissary")).toBe(true);
    expect(segments.has("cross_icp")).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, CONTENT_MARKETING_PIPELINE_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CONTENT_MARKETING_PIPELINE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CONTENT_MARKETING_PIPELINE_NPM_SCRIPT]).toContain(
      "audit-content-marketing-pipeline.ts",
    );
    expect(pkg.scripts?.["test:ci:content-marketing-pipeline"]).toContain(
      CONTENT_MARKETING_PIPELINE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, CONTENT_MARKETING_PIPELINE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:content-marketing-pipeline");
  });

  it("formats audit lines", () => {
    const summary = auditContentMarketingPipeline(ROOT);
    const lines = formatContentMarketingPipelineAuditLines(summary);
    expect(lines.some((line) => line.includes(CONTENT_MARKETING_PIPELINE_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
