/**
 * P3-85 — Knowledge base SEO: FAQPage schema for Google Featured Snippets.
 *
 * @see docs/kb-seo-faq-schema-p3-85.md
 */

export const KB_SEO_FAQ_SCHEMA_P3_85_POLICY_ID = "kb-seo-faq-schema-p3-85-v1" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_DOC = "docs/kb-seo-faq-schema-p3-85.md" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_ARTIFACT = "artifacts/kb-seo-faq-schema-p3-85.json" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_CONTENT_MODULE = "lib/kb/kb-faq-content.ts" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_SCHEMA_MODULE = "lib/kb/kb-faq-schema.ts" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_COMPONENT = "components/kb/kb-faq-section.tsx" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_AUDIT_MODULE =
  "lib/marketing/kb-seo-faq-schema-p3-85-audit.ts" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_CHECK_NPM_SCRIPT = "check:kb-seo-faq-schema-p3-85" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_UNIT_TEST =
  "tests/unit/kb-seo-faq-schema-p3-85.test.ts" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_KB_PAGE = "app/kb/[[...slug]]/page.tsx" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_KB_PAGES = "components/kb/kb-pages.tsx" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_FAQ_COMPONENT = "components/seo/schema-org.tsx" as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_MIN_ENTRIES = 8 as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_REQUIRED_TYPES = ["FAQPage", "Question", "Answer"] as const;

export const KB_SEO_FAQ_SCHEMA_P3_85_WIRING_PATHS = [
  KB_SEO_FAQ_SCHEMA_P3_85_DOC,
  KB_SEO_FAQ_SCHEMA_P3_85_ARTIFACT,
  KB_SEO_FAQ_SCHEMA_P3_85_AUDIT_MODULE,
  KB_SEO_FAQ_SCHEMA_P3_85_CONTENT_MODULE,
  KB_SEO_FAQ_SCHEMA_P3_85_SCHEMA_MODULE,
  KB_SEO_FAQ_SCHEMA_P3_85_COMPONENT,
  KB_SEO_FAQ_SCHEMA_P3_85_UNIT_TEST,
  KB_SEO_FAQ_SCHEMA_P3_85_CI_WORKFLOW,
  KB_SEO_FAQ_SCHEMA_P3_85_KB_PAGE,
  KB_SEO_FAQ_SCHEMA_P3_85_KB_PAGES,
  KB_SEO_FAQ_SCHEMA_P3_85_FAQ_COMPONENT,
] as const;
