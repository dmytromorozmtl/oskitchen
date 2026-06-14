/**
 * P3-96 — Honest hardware ecosystem deferral copy and banned phrases.
 *
 * @see docs/hardware-ecosystem-deferral-p3-96.md
 */

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_STATUS = "DEFERRED_NO_CALENDAR_DATE" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_PUBLIC_LINE =
  "No proprietary hardware ecosystem — browser POS on BYOD tablets, browser print to Epson/Star, and third-party devices you already own." as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_HONESTY_NOTE =
  "OS Kitchen does not sell proprietary terminals, certified hardware bundles, or Toast-style hardware leases. Software-first on devices operators already own." as const;

/** Operator hardware paths without an OS Kitchen hardware SKU. */
export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ALTERNATIVES = [
  {
    id: "byod-browser-pos",
    title: "Browser POS on BYOD tablets",
    path: "/dashboard/pos",
    maturity: "BETA",
  },
  {
    id: "browser-print",
    title: "Browser print (Epson/Star)",
    path: "/dashboard/settings",
    maturity: "BETA",
  },
  {
    id: "browser-kds",
    title: "Browser kitchen display",
    path: "/dashboard/kitchen",
    maturity: "BETA",
  },
  {
    id: "trust-hardware-honesty",
    title: "Hardware honesty / compat status",
    path: "/trust",
    maturity: "LIVE",
  },
] as const;

/** Banned in GTM/marketing — hardware ecosystem is deferred, not teased. */
export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_BANNED_PHRASES = [
  "hardware ecosystem coming soon",
  "Hardware ecosystem coming soon",
  "OS Kitchen hardware bundle",
  "certified OS Kitchen hardware",
  "proprietary hardware ecosystem from OS Kitchen",
  "full hardware stack coming soon",
  "integrated hardware suite coming soon",
  "native hardware ecosystem launch",
  "Toast hardware bundle from OS Kitchen",
] as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/PRODUCT_ROADMAP_2026.md",
  "docs/public-roadmap-p3-69.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_SCAN_EXCLUDE_FILES = [
  "lib/marketing/hardware-ecosystem-deferral-p3-96-content.ts",
  "lib/marketing/hardware-ecosystem-deferral-p3-96-policy.ts",
  "lib/marketing/hardware-ecosystem-deferral-p3-96-audit.ts",
  "lib/marketing/remove-hardware-roadmap-p1-25-policy.ts",
  "lib/marketing/remove-hardware-roadmap-p1-25-audit.ts",
  "lib/marketing/native-payment-terminal-deferral-p3-94-content.ts",
  "lib/marketing/native-payment-terminal-deferral-p3-94-policy.ts",
  "tests/unit/hardware-ecosystem-deferral-p3-96.test.ts",
  "tests/unit/remove-hardware-roadmap-p1-25.test.ts",
] as const;
