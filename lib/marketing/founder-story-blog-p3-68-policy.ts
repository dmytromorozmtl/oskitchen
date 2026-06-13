/**
 * Blueprint P3-68 — Founder story blog post.
 *
 * @see docs/founding-customer-story.md
 * @see docs/founder-story-blog-p3-68.md
 */

export const FOUNDER_STORY_BLOG_P3_68_POLICY_ID = "founder-story-blog-p3-68-v1" as const;

export const FOUNDER_STORY_BLOG_P3_68_DOC = "docs/founder-story-blog-p3-68.md" as const;

export const FOUNDER_STORY_BLOG_P3_68_ARTIFACT =
  "artifacts/founder-story-blog-p3-68-registry.json" as const;

export const FOUNDER_STORY_BLOG_P3_68_AUDIT_SCRIPT =
  "scripts/audit-founder-story-blog-p3-68.ts" as const;

export const FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPT = "audit:founder-story-blog-p3-68" as const;

export const FOUNDER_STORY_BLOG_P3_68_CHECK_NPM_SCRIPT =
  "check:founder-story-blog-p3-68" as const;

export const FOUNDER_STORY_BLOG_P3_68_UNIT_TEST =
  "tests/unit/founder-story-blog-p3-68.test.ts" as const;

export const FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC = "docs/founding-customer-story.md" as const;

export const FOUNDER_STORY_BLOG_P3_68_UPSTREAM_POLICY_ID = "founding-customer-story-v1" as const;

export const FOUNDER_STORY_BLOG_P3_68_SLUG = "why-we-built-os-kitchen" as const;

export const FOUNDER_STORY_BLOG_P3_68_PATH =
  `/blog/${FOUNDER_STORY_BLOG_P3_68_SLUG}` as const;

export const FOUNDER_STORY_BLOG_P3_68_PAGE =
  "app/blog/why-we-built-os-kitchen/page.tsx" as const;

export const FOUNDER_STORY_BLOG_P3_68_CONTENT =
  "lib/marketing/blog-content/why-we-built-os-kitchen.tsx" as const;

export const FOUNDER_STORY_BLOG_P3_68_NPM_SCRIPTS = [
  "test:ci:founder-story-blog",
  "test:ci:founder-story-blog:cert",
] as const;

export const FOUNDER_STORY_BLOG_P3_68_REQUIRED_SECTIONS = [
  "The problem we saw",
  "Why we built before the first customer",
  "Founder quote",
  "Design partner program open",
] as const;

export const FOUNDER_STORY_BLOG_P3_68_HONESTY_MARKERS = [
  "0 signed founding customers",
  "BETA",
  "Honesty rule",
  "not a customer testimonial",
] as const;

export const FOUNDER_STORY_BLOG_P3_68_WIRING_PATHS = [
  FOUNDER_STORY_BLOG_P3_68_DOC,
  FOUNDER_STORY_BLOG_P3_68_UPSTREAM_DOC,
  "docs/case-study-template-pre-pilot.md",
  FOUNDER_STORY_BLOG_P3_68_PAGE,
  FOUNDER_STORY_BLOG_P3_68_CONTENT,
  "lib/marketing/founder-story-blog-p3-68-measurement.ts",
  "lib/marketing/founder-story-blog-p3-68-audit.ts",
  FOUNDER_STORY_BLOG_P3_68_UNIT_TEST,
  FOUNDER_STORY_BLOG_P3_68_ARTIFACT,
] as const;
