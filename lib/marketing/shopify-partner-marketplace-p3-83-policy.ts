/**
 * P3-83 — Shopify Partner App Marketplace listing prep + submission bundle.
 *
 * @see docs/shopify-partner-marketplace-p3-83.md
 * @see docs/SHOPIFY_APP_MARKETPLACE_READINESS.md
 */

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_POLICY_ID =
  "shopify-partner-marketplace-p3-83-v1" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_DOC =
  "docs/shopify-partner-marketplace-p3-83.md" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARTIFACT =
  "artifacts/shopify-partner-marketplace-p3-83.json" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_CONTENT_MODULE =
  "lib/marketing/shopify-partner-marketplace-p3-83-content.ts" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_AUDIT_MODULE =
  "lib/marketing/shopify-partner-marketplace-p3-83-audit.ts" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_CHECK_NPM_SCRIPT =
  "check:shopify-partner-marketplace-p3-83" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_UNIT_TEST =
  "tests/unit/shopify-partner-marketplace-p3-83.test.ts" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_READINESS_DOC =
  "docs/SHOPIFY_APP_MARKETPLACE_READINESS.md" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY_DOC =
  "docs/SHOPIFY_LISTING_COPY.md" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR =
  "artifacts/shopify-partner-marketplace" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_DRAFT =
  "artifacts/shopify-partner-marketplace/listing-draft.md" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST =
  "artifacts/shopify-partner-marketplace/submission-checklist.md" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME =
  "OS Kitchen Fulfillment Sync" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_STATUS =
  "PREP_READY_NOT_LISTED" as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_HONESTY_MARKERS = [
  "not yet listed",
  "no Shopify endorsement",
  "LIVE connector",
  "development store",
] as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_PHASES = [
  "Partner account",
  "App shell",
  "Listing copy",
  "Screenshots",
  "GDPR webhooks",
  "Dev store QA",
  "Submit for review",
] as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_UPSTREAM = [
  "docs/SHOPIFY_INTEGRATION.md",
  "docs/shopify-inventory-sync-proof-p0-11.md",
  "docs/shopify-webhook-kds-e2e-p0-14.md",
  "artifacts/shopify-webhook-kds-live-smoke.json",
  "artifacts/shopify-inventory-sync-proof.json",
] as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_WIRING_PATHS = [
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_DOC,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARTIFACT,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_AUDIT_MODULE,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_CONTENT_MODULE,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_UNIT_TEST,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_CI_WORKFLOW,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_READINESS_DOC,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY_DOC,
  `${SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR}/README.md`,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_DRAFT,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST,
  ...SHOPIFY_PARTNER_MARKETPLACE_P3_83_UPSTREAM,
] as const;
