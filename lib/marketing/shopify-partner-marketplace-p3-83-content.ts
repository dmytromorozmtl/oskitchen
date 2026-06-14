import {
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_DRAFT,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST,
} from "@/lib/marketing/shopify-partner-marketplace-p3-83-policy";

export type ShopifyMarketplaceAsset = {
  id: string;
  label: string;
  archivePath: string;
  spec: string;
  honestyLabel: string | null;
};

/** Required Shopify App Marketplace listing assets (P3-83). */
export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_ASSETS: readonly ShopifyMarketplaceAsset[] =
  [
    {
      id: "app-icon",
      label: "App icon",
      archivePath: `${SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR}/app-icon-1200.png`,
      spec: "1200×1200 PNG",
      honestyLabel: null,
    },
    {
      id: "screenshot-order-hub",
      label: "Screenshot — Order hub",
      archivePath: `${SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR}/screenshots/order-hub.png`,
      spec: "1600×900 screenshot",
      honestyLabel: "LIVE",
    },
    {
      id: "screenshot-kds",
      label: "Screenshot — KDS queue",
      archivePath: `${SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR}/screenshots/kds-queue.png`,
      spec: "1600×900 screenshot",
      honestyLabel: "LIVE",
    },
    {
      id: "screenshot-product-mapping",
      label: "Screenshot — Product mapping",
      archivePath: `${SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR}/screenshots/product-mapping.png`,
      spec: "1600×900 screenshot",
      honestyLabel: "LIVE",
    },
    {
      id: "screenshot-integration-health",
      label: "Screenshot — Integration health",
      archivePath: `${SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR}/screenshots/integration-health.png`,
      spec: "1600×900 screenshot",
      honestyLabel: "SKIPPED rows visible",
    },
    {
      id: "screenshot-inventory-sync",
      label: "Screenshot — Inventory sync",
      archivePath: `${SHOPIFY_PARTNER_MARKETPLACE_P3_83_ARCHIVE_DIR}/screenshots/inventory-sync.png`,
      spec: "1600×900 screenshot",
      honestyLabel: "LIVE dev store",
    },
  ] as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY = {
  appName: SHOPIFY_PARTNER_MARKETPLACE_P3_83_APP_NAME,
  tagline: "Turn Shopify food orders into kitchen production and fulfillment",
  taglineMaxChars: 80,
  shortDescription:
    "OS Kitchen connects Shopify orders to kitchen production, KDS, packing labels, and inventory sync for food businesses.",
  longDescription:
    "Connect your Shopify store to OS Kitchen. Orders flow via HMAC-verified webhooks into kitchen tasks and KDS. Product mapping links Shopify SKUs to production items. Bidirectional inventory sync keeps kitchen stock aligned with Shopify. OS Kitchen is not yet listed on the Shopify App Marketplace — this listing is prepared for Partner review. No Shopify endorsement implied.",
  supportUrl: "https://os-kitchen.com/support",
  privacyUrl: "https://os-kitchen.com/legal/privacy",
  termsUrl: "https://os-kitchen.com/legal/terms",
  pricingUrl: "https://os-kitchen.com/pricing",
} as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_WEBHOOKS = [
  "orders/create",
  "orders/updated",
  "products/update",
  "app/uninstalled",
  "customers/data_request",
  "customers/redact",
  "shop/redact",
] as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_REQUIRED_SCOPES = [
  "read_orders",
  "write_orders",
  "read_products",
  "read_customers",
] as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_COPY_ARTIFACT_PATHS = [
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_DRAFT,
  SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST,
] as const;

export const SHOPIFY_PARTNER_MARKETPLACE_P3_83_SUBMISSION_CHECKLIST_ITEMS = [
  { id: "partner-account", phase: "Partner account", action: "Create Shopify Partner org + dev store" },
  { id: "app-shell", phase: "App shell", action: "Configure OAuth, embedded app URL, session tokens" },
  { id: "listing-copy", phase: "Listing copy", action: "Finalize listing-draft.md — lint forbidden claims" },
  { id: "screenshots", phase: "Screenshots", action: "Capture 5 screenshots per asset checklist" },
  { id: "gdpr-webhooks", phase: "GDPR webhooks", action: "Wire customers/data_request, customers/redact, shop/redact" },
  { id: "dev-store-qa", phase: "Dev store QA", action: "Run smoke:shopify-live + inventory sync proof" },
  { id: "submit-review", phase: "Submit for review", action: "Partner Dashboard → Submit for review" },
] as const;

export function taglineWithinShopifyLimit(tagline: string): boolean {
  return tagline.length <= SHOPIFY_PARTNER_MARKETPLACE_P3_83_LISTING_COPY.taglineMaxChars;
}
