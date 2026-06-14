/**
 * P3-94 — Honest native payment terminal deferral copy and banned phrases.
 *
 * @see docs/native-payment-terminal-deferral-p3-94.md
 */

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_STATUS = "DEFERRED_NO_CALENDAR_DATE" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_PUBLIC_LINE =
  "No native OS Kitchen payment terminals — browser POS on BYOD, cash/external terminal workflows, and Stripe hosted checkout today." as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_HONESTY_NOTE =
  "OS Kitchen does not manufacture proprietary card readers or bundle Toast-style terminal leases. Stripe Terminal SDK integration is deferred with no calendar date." as const;

/** Card-present and checkout alternatives operators use today. */
export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ALTERNATIVES = [
  {
    id: "browser-pos",
    title: "Browser counter POS",
    path: "/dashboard/pos",
    maturity: "BETA",
  },
  {
    id: "cash-external-terminal",
    title: "Cash + external terminal workflow",
    path: "/dashboard/pos",
    maturity: "LIVE",
  },
  {
    id: "storefront-checkout",
    title: "Stripe hosted storefront checkout",
    path: "/dashboard/storefront",
    maturity: "BETA",
  },
  {
    id: "stripe-connect",
    title: "Stripe Connect payments setup",
    path: "/dashboard/settings",
    maturity: "BETA",
  },
] as const;

/** Banned in GTM/marketing — native terminals are deferred, not teased. */
export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_BANNED_PHRASES = [
  "native payment terminal coming soon",
  "Native payment terminal coming soon",
  "OS Kitchen payment terminal",
  "OS Kitchen card reader",
  "proprietary OS Kitchen terminal",
  "our payment terminal hardware",
  "certified OS Kitchen reader",
  "Toast-style terminal bundle from OS Kitchen",
  "OS Kitchen terminal lease",
] as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/PRODUCT_ROADMAP_2026.md",
  "docs/public-roadmap-p3-69.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_SCAN_EXCLUDE_FILES = [
  "lib/marketing/native-payment-terminal-deferral-p3-94-content.ts",
  "lib/marketing/native-payment-terminal-deferral-p3-94-policy.ts",
  "lib/marketing/native-payment-terminal-deferral-p3-94-audit.ts",
  "tests/unit/native-payment-terminal-deferral-p3-94.test.ts",
] as const;
