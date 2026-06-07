/**
 * Absolute Final Task 150 — full competitor parity check (21 competitors).
 *
 * @see docs/full-competitor-parity-check.md
 * @see tests/unit/absolute-final-competitor-parity-check.test.ts
 */

export const COMPETITOR_PARITY_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-competitor-parity-21-v1" as const;

export const COMPETITOR_PARITY_DOC_PATH = "docs/full-competitor-parity-check.md" as const;

export const COMPETITOR_PARITY_TOTAL = 21 as const;

export type CompetitorParityStatus = "PARITY" | "PARTIAL" | "DEFER" | "LIVE";

export type CompetitorParityEntry = {
  slug: string;
  displayName: string;
  osKitchenEdge: string;
  gap: string;
  parityStatus: CompetitorParityStatus;
};

/** All 21 competitors from full audit battle map (Section 23). */
export const COMPETITOR_PARITY_21_SLUGS = [
  "toast",
  "square",
  "lightspeed",
  "poster",
  "clover",
  "touchbistro",
  "revel",
  "oracle_micros",
  "ncr_aloha",
  "spoton",
  "olo",
  "chownow",
  "7shifts",
  "homebase",
  "quickbooks",
  "doordash",
  "uber_eats",
  "shopify",
  "woocommerce",
  "marketman",
  "marginedge",
] as const;

export type CompetitorParity21Slug = (typeof COMPETITOR_PARITY_21_SLUGS)[number];

export const COMPETITOR_PARITY_21_ENTRIES: readonly CompetitorParityEntry[] = [
  { slug: "toast", displayName: "Toast", osKitchenEdge: "Integration health moat", gap: "Hardware ecosystem", parityStatus: "PARTIAL" },
  { slug: "square", displayName: "Square", osKitchenEdge: "Marketplace 3-sided", gap: "Brand recognition", parityStatus: "PARTIAL" },
  { slug: "lightspeed", displayName: "Lightspeed", osKitchenEdge: "Enterprise SSO/SCIM", gap: "Regional POS depth", parityStatus: "PARTIAL" },
  { slug: "poster", displayName: "Poster", osKitchenEdge: "10/10 gaps closed", gap: "Poster EU presence", parityStatus: "PARTIAL" },
  { slug: "clover", displayName: "Clover", osKitchenEdge: "AI managers suite", gap: "Device fleet", parityStatus: "PARTIAL" },
  { slug: "touchbistro", displayName: "TouchBistro", osKitchenEdge: "Full-stack OS", gap: "iPad-native polish", parityStatus: "PARTIAL" },
  { slug: "revel", displayName: "Revel", osKitchenEdge: "Commissary OS", gap: "Legacy migrations", parityStatus: "PARTIAL" },
  { slug: "oracle_micros", displayName: "Oracle MICROS", osKitchenEdge: "Modern UX", gap: "Enterprise incumbency", parityStatus: "PARTIAL" },
  { slug: "ncr_aloha", displayName: "NCR Aloha", osKitchenEdge: "KDS multi-station", gap: "Installed base", parityStatus: "PARTIAL" },
  { slug: "spoton", displayName: "SpotOn", osKitchenEdge: "Quick Start", gap: "Local sales force", parityStatus: "PARTIAL" },
  { slug: "olo", displayName: "Olo", osKitchenEdge: "Digital ordering", gap: "Dispatch network", parityStatus: "PARTIAL" },
  { slug: "chownow", displayName: "ChowNow", osKitchenEdge: "Storefront", gap: "Marketplace", parityStatus: "PARTIAL" },
  { slug: "7shifts", displayName: "7shifts", osKitchenEdge: "Native scheduling", gap: "Standalone HR brand", parityStatus: "PARTIAL" },
  { slug: "homebase", displayName: "Homebase", osKitchenEdge: "Integration LIVE", gap: "Labor-only focus", parityStatus: "LIVE" },
  { slug: "quickbooks", displayName: "QuickBooks", osKitchenEdge: "Accounting sync", gap: "GL depth", parityStatus: "PARTIAL" },
  { slug: "doordash", displayName: "DoorDash", osKitchenEdge: "LIVE webhook", gap: "Aggregator dependency", parityStatus: "LIVE" },
  { slug: "uber_eats", displayName: "Uber Eats", osKitchenEdge: "LIVE webhook", gap: "Commission economics", parityStatus: "LIVE" },
  { slug: "shopify", displayName: "Shopify", osKitchenEdge: "Channel sync", gap: "Non-F&B", parityStatus: "PARTIAL" },
  { slug: "woocommerce", displayName: "WooCommerce", osKitchenEdge: "Channel sync", gap: "Plugin fragility", parityStatus: "PARTIAL" },
  { slug: "marketman", displayName: "MarketMan", osKitchenEdge: "Inventory", gap: "Breadth", parityStatus: "PARTIAL" },
  { slug: "marginedge", displayName: "MarginEdge", osKitchenEdge: "Invoice AI", gap: "Platform breadth", parityStatus: "PARTIAL" },
] as const;

export const COMPETITOR_PARITY_WIRING_PATHS = [
  COMPETITOR_PARITY_DOC_PATH,
  "lib/competitor/absolute-final-competitor-parity-policy.ts",
  "lib/competitor/absolute-final-competitor-parity-audit.ts",
  "lib/competitor/competitor-battle-cards-eight-policy.ts",
  "lib/competitor/competitor-sales-safe-claims-policy.ts",
  "docs/competitive-battle-cards.md",
  "docs/competitor-feature-gap-matrix.md",
  "docs/competitor-comparison-honest.md",
  "docs/COMPETITOR_POSITIONING.md",
  "artifacts/competitor-feature-tracker.json",
  "tests/unit/absolute-final-competitor-parity-check.test.ts",
  "tests/unit/competitor-battle-cards-eight.test.ts",
  "tests/unit/competitor-sales-safe-claims.test.ts",
] as const;

export const COMPETITOR_PARITY_UNIT_TEST =
  "tests/unit/absolute-final-competitor-parity-check.test.ts" as const;

export const COMPETITOR_PARITY_CI_SCRIPTS = [
  "test:ci:competitor-parity-absolute-final",
  "test:ci:competitor-parity-absolute-final:cert",
] as const;

export const COMPETITOR_PARITY_MANUAL_GATE_NOTE =
  "Parity matrix is sales-safe strategy — not certified feature equivalence; verify LIVE status against integration smoke artifacts before customer claims." as const;

export const COMPETITOR_PARITY_DOC_SECTIONS = [
  "Absolute Final Task 150",
  "21-competitor parity matrix",
  "Parity status legend",
  "Upstream competitor artifacts",
  "Forbidden parity claims",
] as const;
