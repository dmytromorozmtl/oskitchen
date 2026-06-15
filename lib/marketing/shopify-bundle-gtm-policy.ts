import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-13 — Shopify bundle GTM polish policy.
 *
 * @see docs/shopify-bundle-sales-guide.md
 * @see docs/shopify-bundle-outbound-sequence.md
 * @see components/marketing/shopify-bundle-landing.tsx
 */

export const SHOPIFY_BUNDLE_GTM_POLICY_ID = "shopify-bundle-gtm-mkt13-v1" as const;

export const SHOPIFY_BUNDLE_LANDING_PATH = "components/marketing/shopify-bundle-landing.tsx" as const;

export const SHOPIFY_BUNDLE_CONTENT_PATH = "lib/marketing/shopify-bundle-content.ts" as const;

/** ICP-first CTA — book fit call before self-serve trial. */
export const SHOPIFY_BUNDLE_PRIMARY_CTA = {
  label: "Book Shopify fit call",
  href: "/book-demo?utm_source=shopify-bundle&utm_medium=landing&utm_campaign=shopify-gtm",
} as const;

export const SHOPIFY_BUNDLE_SECONDARY_CTA = {
  label: "Start free trial",
  href: "/signup?utm_source=shopify-bundle&utm_medium=landing",
} as const;

export const SHOPIFY_BUNDLE_CONNECT_CTA = {
  label: "Connect Shopify (beta)",
  href: "/dashboard/integrations/shopify",
} as const;

/** Three-step GTM path shown on landing — matches pilot setup wizard. */
export const SHOPIFY_BUNDLE_SETUP_STEPS = [
  {
    step: 1,
    title: "Connect custom app",
    description:
      "Paste Admin API token and webhook signing secret — 5-step pilot wizard in dashboard guides credentials and test connection.",
  },
  {
    step: 2,
    title: "Review Integration Health",
    description:
      "Shopify row shows PASS, SKIPPED, or FAILED — not a fake green tile. SKIPPED means live smoke not run yet.",
  },
  {
    step: 3,
    title: "First order in Order Hub",
    description:
      "Place a test order on your dev store; confirm webhook delivery and KDS ticket beside counter sales.",
  },
] as const;

export const SHOPIFY_INTEGRATION_HEALTH_GTM_POINTS = [
  "Shopify webhook signature validation visible in Integration Health — not buried in logs.",
  "BETA badge on inventory compare until pilot proof artifact PASS.",
  "Recovery links from Today Command Center when webhook backlog grows.",
  "Same honesty surface powers GO/NO-GO pilot gates — sales can screen-share SKIPPED rows.",
] as const;

export const SHOPIFY_BUNDLE_GTM_STRIP_PATH =
  "components/marketing/shopify-bundle-gtm-strip.tsx" as const;

export const SHOPIFY_BUNDLE_GTM_REQUIRED_LANDING_MARKERS = [
  "ShopifyBundleGtmStrip",
  "bookDemoPrimary",
  "SHOPIFY_BUNDLE_PRIMARY_CTA",
] as const;

export const SHOPIFY_BUNDLE_GTM_REQUIRED_STRIP_MARKERS = ["Integration Health"] as const;

export type ShopifyBundleGtmLandingAudit = {
  landingPath: typeof SHOPIFY_BUNDLE_LANDING_PATH;
  stripPath: typeof SHOPIFY_BUNDLE_GTM_STRIP_PATH;
  contentPath: typeof SHOPIFY_BUNDLE_CONTENT_PATH;
  missingMarkers: string[];
  setupStepCount: number;
  passed: boolean;
};

export function auditShopifyBundleGtmLanding(root = process.cwd()): ShopifyBundleGtmLandingAudit {
  const landing = readFileSync(join(root, SHOPIFY_BUNDLE_LANDING_PATH), "utf8");
  const strip = readFileSync(join(root, SHOPIFY_BUNDLE_GTM_STRIP_PATH), "utf8");
  const content = readFileSync(join(root, SHOPIFY_BUNDLE_CONTENT_PATH), "utf8");

  const missingLanding = SHOPIFY_BUNDLE_GTM_REQUIRED_LANDING_MARKERS.filter(
    (marker) => !landing.includes(marker),
  );
  const missingStrip = SHOPIFY_BUNDLE_GTM_REQUIRED_STRIP_MARKERS.filter(
    (marker) => !strip.includes(marker),
  );
  const missingContent = !content.includes("Integration Health") ? ["Integration Health in CTA"] : [];

  const missingMarkers = [...missingLanding, ...missingStrip, ...missingContent];

  return {
    landingPath: SHOPIFY_BUNDLE_LANDING_PATH,
    stripPath: SHOPIFY_BUNDLE_GTM_STRIP_PATH,
    contentPath: SHOPIFY_BUNDLE_CONTENT_PATH,
    missingMarkers,
    setupStepCount: SHOPIFY_BUNDLE_SETUP_STEPS.length,
    passed: missingMarkers.length === 0,
  };
}
