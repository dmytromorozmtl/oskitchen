/**
 * P3-92 — Honest consumer app deferral copy and banned marketing phrases.
 *
 * @see docs/consumer-app-deferral-p3-92.md
 */

import { CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD } from "@/lib/marketing/consumer-app-deferral-p3-92-policy";

export const CONSUMER_APP_DEFERRAL_P3_92_STATUS = "DEFERRED_UNTIL_500_CUSTOMERS" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_PUBLIC_LINE =
  `No native consumer app (App Store / Play Store) until ${CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD}+ paying restaurant operators — use branded storefront PWA and mobile web checkout today.` as const;

export const CONSUMER_APP_DEFERRAL_P3_92_HONESTY_NOTE =
  "OS Kitchen is operator-first B2B software. End-customer ordering runs through your hosted storefront, QR links, and white-label PWA — not a separate diner app we maintain in app stores." as const;

/** What operators use instead of a consumer app today. */
export const CONSUMER_APP_DEFERRAL_P3_92_ALTERNATIVES = [
  {
    id: "storefront-pwa",
    title: "Branded storefront PWA",
    path: "/dashboard/storefront",
    maturity: "BETA",
  },
  {
    id: "mobile-web-checkout",
    title: "Mobile web checkout",
    path: "/dashboard/storefront",
    maturity: "BETA",
  },
  {
    id: "qr-ordering",
    title: "QR → storefront ordering",
    path: "/dashboard/qr-codes",
    maturity: "BETA",
  },
  {
    id: "loyalty-storefront",
    title: "Storefront loyalty earn/redeem",
    path: "/dashboard/storefront/loyalty",
    maturity: "BETA",
  },
] as const;

/** Banned in GTM/marketing — consumer app is deferred, not teased. */
export const CONSUMER_APP_DEFERRAL_P3_92_BANNED_PHRASES = [
  "consumer app coming soon",
  "Consumer app coming soon",
  "download our app",
  "Download our app",
  "App Store launch",
  "app store launch",
  "consumer mobile app in beta",
  "diner app coming soon",
  "end-customer app roadmap",
] as const;

export const CONSUMER_APP_DEFERRAL_P3_92_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/PRODUCT_ROADMAP_2026.md",
  "docs/public-roadmap-p3-69.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const CONSUMER_APP_DEFERRAL_P3_92_SCAN_EXCLUDE_FILES = [
  "lib/marketing/consumer-app-deferral-p3-92-content.ts",
  "lib/marketing/consumer-app-deferral-p3-92-policy.ts",
  "lib/marketing/consumer-app-deferral-p3-92-audit.ts",
  "tests/unit/consumer-app-deferral-p3-92.test.ts",
] as const;

export function consumerAppDeferralMeetsThreshold(currentCustomers: number): boolean {
  return currentCustomers >= CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD;
}
