/**
 * P3-98 — Honest native mobile app deferral copy and banned phrases.
 *
 * @see docs/native-mobile-app-deferral-p3-98.md
 */

import { NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARR_THRESHOLD } from "@/lib/marketing/native-mobile-app-deferral-p3-98-policy";

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_STATUS = "DEFERRED_UNTIL_1M_ARR" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_PUBLIC_LINE =
  "No native iOS or Android mobile app until $1M ARR — mobile browser dashboard, responsive web, and PWA today." as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_HONESTY_NOTE =
  "OS Kitchen is web-first. Native App Store and Play Store apps (operator or consumer) stay deferred until $1M ARR and clear product-market fit." as const;

/** Mobile workflows without native store apps today. */
export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_ALTERNATIVES = [
  {
    id: "mobile-browser-dashboard",
    title: "Mobile browser dashboard",
    path: "/dashboard",
    maturity: "BETA",
  },
  {
    id: "responsive-web-pos",
    title: "Responsive web POS / KDS",
    path: "/dashboard/pos",
    maturity: "BETA",
  },
  {
    id: "storefront-pwa",
    title: "Branded storefront PWA",
    path: "/dashboard/storefront",
    maturity: "BETA",
  },
  {
    id: "add-to-home-screen",
    title: "Add to Home Screen (web app)",
    path: "/quick-start",
    maturity: "BETA",
  },
] as const;

/** Banned in GTM/marketing — native mobile apps are deferred, not teased. */
export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_BANNED_PHRASES = [
  "native mobile app coming soon",
  "Native mobile app coming soon",
  "OS Kitchen mobile app launch",
  "iOS and Android app coming soon",
  "mobile app launch Q1",
  "mobile app launch Q2",
  "Play Store app coming soon",
  "native Android app coming soon",
  "download our mobile app",
  "Download our mobile app",
] as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/PRODUCT_ROADMAP_2026.md",
  "docs/public-roadmap-p3-69.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_SCAN_EXCLUDE_FILES = [
  "lib/marketing/native-mobile-app-deferral-p3-98-content.ts",
  "lib/marketing/native-mobile-app-deferral-p3-98-policy.ts",
  "lib/marketing/native-mobile-app-deferral-p3-98-audit.ts",
  "lib/marketing/consumer-app-deferral-p3-92-content.ts",
  "lib/marketing/consumer-app-deferral-p3-92-policy.ts",
  "lib/marketing/consumer-app-deferral-p3-92-audit.ts",
  "lib/marketing/native-ios-app-deferral-p3-95-content.ts",
  "lib/marketing/native-ios-app-deferral-p3-95-policy.ts",
  "lib/marketing/native-ios-app-deferral-p3-95-audit.ts",
  "tests/unit/native-mobile-app-deferral-p3-98.test.ts",
  "tests/unit/consumer-app-deferral-p3-92.test.ts",
  "tests/unit/native-ios-app-deferral-p3-95.test.ts",
] as const;

export function nativeMobileAppDeferralMeetsArrThreshold(currentArr: number): boolean {
  return currentArr >= NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARR_THRESHOLD;
}
