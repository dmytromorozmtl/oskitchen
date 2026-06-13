import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditFounderStoryBlogP3_68,
  formatFounderStoryBlogP3_68AuditLines,
} from "@/lib/marketing/founder-story-blog-p3-68-audit";
import { validateFounderStoryBlogContract } from "@/lib/marketing/founder-story-blog-p3-68-measurement";
import {
  FOUNDER_STORY_BLOG_P3_68_AUDIT_SCRIPT,
  FOUNDER_STORY_BLOG_P3_68_CHECK_NPM_SCRIPT,
  FOUNDER_STORY_BLOG_P3_68_DOC,
  FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPT,
  FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPTS,
  FOUNDER_STORY_BLOG_P3_68_PATH,
  FOUNDER_STORY_BLOG_P3_68_POLICY_ID,
  FOUNDER_STORY_BLOG_P3_68_SLUG,
  FOUNDER_STORY_BLOG_P3_68_UNIT_TEST,
  FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC,
  FOUNDER_STORY_BLOG_P3_68_UPSTREAM_POLICY_ID,
} from "@/lib/marketing/founder-story-blog-p3-68-policy";

const ROOT = process.cwd();

describe("Founder story blog (P3-68)", () => {
  it("locks P3-68 policy and public blog path", () => {
    expect(FOUNDER_STORY_BLOG_P3_68_POLICY_ID).toBe("founder-story-blog-p3-68-v1");
    expect(FOUNDER_STORY_BLOG_P3_68_UPSTREAM_POLICY_ID).toBe("founding-customer-story-v1");
    expect(FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC).toBe("docs/founding-customer-story.md");
    expect(FOUNDER_STORY_BLOG_P3_68_SLUG).toBe("why-we-built-os-kitchen");
    expect(FOUNDER_STORY_BLOG_P3_68_PATH).toBe("/blog/why-we-built-os-kitchen");
  });

  it("validates founder story blog contract", () => {
    const validation = validateFounderStoryBlogContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.blogPageWired).toBe(true);
    expect(validation.blogContentWired).toBe(true);
    expect(validation.blogIndexWired).toBe(true);
    expect(validation.sectionsPresent).toBe(true);
    expect(validation.honestyMarkersOk).toBe(true);
    expect(validation.upstreamDocOk).toBe(true);
  });

  it("passes full founder story blog audit", () => {
    const summary = auditFounderStoryBlogP3_68(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.upstreamPolicyAligned).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatFounderStoryBlogP3_68AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, FOUNDER_STORY_BLOG_P3_68_DOC))).toBe(true);
    expect(existsSync(join(ROOT, FOUNDER_STORY_BLOG_P3_68_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, FOUNDER_STORY_BLOG_P3_68_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPT]).toContain(
      "audit-founder-story-blog-p3-68.ts",
    );
    expect(pkg.scripts?.[FOUNDER_STORY_BLOG_P3_68_CHECK_NPM_SCRIPT]).toContain(
      FOUNDER_STORY_BLOG_P3_68_UNIT_TEST,
    );
    for (const script of FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
