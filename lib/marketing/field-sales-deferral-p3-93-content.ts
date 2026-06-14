/**
 * P3-93 — Honest digital-only GTM copy and banned field-sales phrases.
 *
 * @see docs/field-sales-deferral-p3-93.md
 */

export const FIELD_SALES_DEFERRAL_P3_93_STATUS = "DIGITAL_ONLY_GTM" as const;

export const FIELD_SALES_DEFERRAL_P3_93_PUBLIC_LINE =
  "No field sales team or on-site rep visits — self-serve signup, book a demo, or join the design partner program." as const;

export const FIELD_SALES_DEFERRAL_P3_93_HONESTY_NOTE =
  "OS Kitchen is software-first and digital-only. We do not run a Toast-style local sales force, territory managers, or on-site install reps." as const;

/** How operators evaluate and buy today. */
export const FIELD_SALES_DEFERRAL_P3_93_ALTERNATIVES = [
  {
    id: "self-serve-signup",
    title: "Self-serve Quick Start",
    path: "/quick-start",
    maturity: "BETA",
  },
  {
    id: "book-demo",
    title: "Book a live demo",
    path: "/book-demo",
    maturity: "LIVE",
  },
  {
    id: "design-partner",
    title: "Design partner program",
    path: "/pricing",
    maturity: "LIVE",
  },
  {
    id: "help-onboarding",
    title: "Guided onboarding docs",
    path: "/kb",
    maturity: "BETA",
  },
] as const;

/** Banned in GTM/marketing — we do not have field sales. */
export const FIELD_SALES_DEFERRAL_P3_93_BANNED_PHRASES = [
  "our field sales team",
  "Our field sales team",
  "OS Kitchen field sales",
  "local rep will visit",
  "Local rep will visit",
  "sales rep will visit your location",
  "on-site visit from our team",
  "field sales team coming soon",
  "territory manager will contact you",
  "regional sales manager will visit",
] as const;

export const FIELD_SALES_DEFERRAL_P3_93_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/PRODUCT_ROADMAP_2026.md",
  "docs/public-roadmap-p3-69.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const FIELD_SALES_DEFERRAL_P3_93_SCAN_EXCLUDE_FILES = [
  "lib/marketing/field-sales-deferral-p3-93-content.ts",
  "lib/marketing/field-sales-deferral-p3-93-policy.ts",
  "lib/marketing/field-sales-deferral-p3-93-audit.ts",
  "tests/unit/field-sales-deferral-p3-93.test.ts",
] as const;
