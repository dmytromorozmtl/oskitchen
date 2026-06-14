/**
 * P3-84 — QuickBooks / Intuit App Partner program application bundle.
 *
 * @see docs/quickbooks-certified-partner-p3-84.md
 * @see docs/QUICKBOOKS_INTEGRATION.md
 */

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID =
  "quickbooks-certified-partner-p3-84-v1" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_DOC =
  "docs/quickbooks-certified-partner-p3-84.md" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARTIFACT =
  "artifacts/quickbooks-certified-partner-p3-84.json" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CONTENT_MODULE =
  "lib/marketing/quickbooks-certified-partner-p3-84-content.ts" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_AUDIT_MODULE =
  "lib/marketing/quickbooks-certified-partner-p3-84-audit.ts" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CHECK_NPM_SCRIPT =
  "check:quickbooks-certified-partner-p3-84" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UNIT_TEST =
  "tests/unit/quickbooks-certified-partner-p3-84.test.ts" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_INTEGRATION_DOC =
  "docs/QUICKBOOKS_INTEGRATION.md" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR =
  "artifacts/quickbooks-partner-program" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST =
  "artifacts/quickbooks-partner-program/application-checklist.md" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_DRAFT =
  "artifacts/quickbooks-partner-program/listing-draft.md" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APP_NAME =
  "OS Kitchen Sales Sync" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_STATUS =
  "APPLICATION_PREP_NOT_CERTIFIED" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_TARGET_SUBMIT =
  "2026-07-15" as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_HONESTY_MARKERS = [
  "not yet certified",
  "no Intuit endorsement",
  "LIVE connector",
  "sandbox",
] as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_PHASES = [
  "Intuit Developer account",
  "App registration",
  "Sandbox QA",
  "Security disclosure",
  "App listing copy",
  "Production keys",
  "Submit application",
] as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UPSTREAM = [
  "docs/QUICKBOOKS_INTEGRATION.md",
  "docs/quickbooks-live-smoke-setup.md",
  "artifacts/quickbooks-live-smoke-summary.json",
  "tests/unit/quickbooks-live-oauth.test.ts",
  "tests/unit/quickbooks-daily-sales-journal.test.ts",
] as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_WIRING_PATHS = [
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_DOC,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARTIFACT,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_AUDIT_MODULE,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CONTENT_MODULE,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UNIT_TEST,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CI_WORKFLOW,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_INTEGRATION_DOC,
  `${QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR}/README.md`,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_DRAFT,
  ...QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UPSTREAM,
] as const;
