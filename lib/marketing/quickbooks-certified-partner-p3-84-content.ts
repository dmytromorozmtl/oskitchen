import {
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APP_NAME,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_DRAFT,
} from "@/lib/marketing/quickbooks-certified-partner-p3-84-policy";

export type QuickBooksPartnerAsset = {
  id: string;
  label: string;
  archivePath: string;
  spec: string;
  honestyLabel: string | null;
};

/** Required Intuit App Partner listing assets (P3-84). */
export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ASSETS: readonly QuickBooksPartnerAsset[] =
  [
    {
      id: "app-logo",
      label: "App logo",
      archivePath: `${QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR}/app-logo-512.png`,
      spec: "512×512 PNG",
      honestyLabel: null,
    },
    {
      id: "screenshot-oauth",
      label: "Screenshot — OAuth connect flow",
      archivePath: `${QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR}/screenshots/oauth-connect.png`,
      spec: "1280×800 screenshot",
      honestyLabel: "LIVE sandbox",
    },
    {
      id: "screenshot-chart-mapping",
      label: "Screenshot — Chart of accounts mapping",
      archivePath: `${QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR}/screenshots/chart-mapping.png`,
      spec: "1280×800 screenshot",
      honestyLabel: "LIVE",
    },
    {
      id: "screenshot-journal",
      label: "Screenshot — Daily sales journal",
      archivePath: `${QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR}/screenshots/daily-journal.png`,
      spec: "1280×800 screenshot",
      honestyLabel: "LIVE sandbox",
    },
    {
      id: "screenshot-integration-health",
      label: "Screenshot — Integration health",
      archivePath: `${QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARCHIVE_DIR}/screenshots/integration-health.png`,
      spec: "1280×800 screenshot",
      honestyLabel: "SKIPPED rows visible",
    },
  ] as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY = {
  appName: QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APP_NAME,
  tagline: "Post daily kitchen sales to QuickBooks automatically",
  taglineMaxChars: 80,
  shortDescription:
    "OS Kitchen syncs revenue aggregation and daily sales journal entries to QuickBooks Online for food operators.",
  longDescription:
    "Connect QuickBooks Online via Intuit OAuth. Map sales and deposit accounts, then post automated daily sales journals from OS Kitchen revenue data. OS Kitchen is not yet certified under the Intuit App Partner program — this application is prepared for review. No Intuit endorsement implied.",
  supportUrl: "https://os-kitchen.com/support",
  privacyUrl: "https://os-kitchen.com/legal/privacy",
  termsUrl: "https://os-kitchen.com/legal/terms",
  pricingUrl: "https://os-kitchen.com/pricing",
} as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_SCOPES = [
  "com.intuit.quickbooks.accounting",
  "openid",
  "profile",
  "email",
] as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ENDPOINTS = [
  "/api/integrations/quickbooks/oauth/callback",
  "/api/integrations/quickbooks/accounts",
  "/api/integrations/quickbooks/sync-journal",
  "/api/export/quickbooks",
] as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_COPY_ARTIFACT_PATHS = [
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_DRAFT,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST,
] as const;

export const QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST_ITEMS = [
  {
    id: "developer-account",
    phase: "Intuit Developer account",
    action: "Create developer.intuit.com account + sandbox company",
  },
  {
    id: "app-registration",
    phase: "App registration",
    action: "Register OAuth app; set redirect URI + accounting scopes",
  },
  {
    id: "sandbox-qa",
    phase: "Sandbox QA",
    action: "Run smoke:quickbooks-live + map chart of accounts",
  },
  {
    id: "security-disclosure",
    phase: "Security disclosure",
    action: "Complete Intuit security questionnaire + data handling doc",
  },
  {
    id: "listing-copy",
    phase: "App listing copy",
    action: "Finalize listing-draft.md — lint forbidden claims",
  },
  {
    id: "production-keys",
    phase: "Production keys",
    action: "Request production OAuth keys after sandbox sign-off",
  },
  {
    id: "submit-application",
    phase: "Submit application",
    action: "Intuit Partner Portal → submit App Partner application",
  },
] as const;

export function taglineWithinQuickBooksLimit(tagline: string): boolean {
  return tagline.length <= QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY.taglineMaxChars;
}
