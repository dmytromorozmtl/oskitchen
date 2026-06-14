/**
 * P3-95 — Honest native iOS operator app deferral copy and banned phrases.
 *
 * @see docs/native-ios-app-deferral-p3-95.md
 */

export const NATIVE_IOS_APP_DEFERRAL_P3_95_STATUS = "DEFERRED_NO_CALENDAR_DATE" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_PUBLIC_LINE =
  "No native iOS App Store app for staff POS/KDS — run dashboard, POS, and kitchen on mobile Safari or Chrome on iPad and iPhone today." as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_HONESTY_NOTE =
  "OS Kitchen is browser-first for operators. We do not ship a native Swift iOS app for staff POS, KDS, or back-office in 2026." as const;

/** Operator mobile workflows available today without an App Store download. */
export const NATIVE_IOS_APP_DEFERRAL_P3_95_ALTERNATIVES = [
  {
    id: "mobile-browser-dashboard",
    title: "Mobile browser dashboard",
    path: "/dashboard",
    maturity: "BETA",
  },
  {
    id: "browser-pos-ipad",
    title: "Browser POS on iPad",
    path: "/dashboard/pos",
    maturity: "BETA",
  },
  {
    id: "browser-kds",
    title: "Browser kitchen display (KDS)",
    path: "/dashboard/kitchen",
    maturity: "BETA",
  },
  {
    id: "add-to-home-screen",
    title: "Add to Home Screen (web app)",
    path: "/quick-start",
    maturity: "BETA",
  },
] as const;

/** Banned in GTM/marketing — native iOS operator app is deferred, not teased. */
export const NATIVE_IOS_APP_DEFERRAL_P3_95_BANNED_PHRASES = [
  "native iOS app coming soon",
  "Native iOS app coming soon",
  "OS Kitchen iOS app",
  "download OS Kitchen on iOS",
  "App Store POS app coming soon",
  "native iPhone app for staff",
  "iOS app launch for operators",
  "staff iOS app coming soon",
  "KDS iOS app coming soon",
] as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/PRODUCT_ROADMAP_2026.md",
  "docs/public-roadmap-p3-69.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_SCAN_EXCLUDE_FILES = [
  "lib/marketing/native-ios-app-deferral-p3-95-content.ts",
  "lib/marketing/native-ios-app-deferral-p3-95-policy.ts",
  "lib/marketing/native-ios-app-deferral-p3-95-audit.ts",
  "lib/marketing/consumer-app-deferral-p3-92-content.ts",
  "lib/marketing/consumer-app-deferral-p3-92-policy.ts",
  "lib/marketing/consumer-app-deferral-p3-92-audit.ts",
  "tests/unit/native-ios-app-deferral-p3-95.test.ts",
  "tests/unit/consumer-app-deferral-p3-92.test.ts",
] as const;
