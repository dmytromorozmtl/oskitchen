/**
 * P2-41 — Suspense boundaries wave 1 (Today, Marketplace, POS, Kitchen).
 *
 * @see docs/suspense-boundaries-p2-41.md
 */

export const SUSPENSE_BOUNDARIES_P2_41_POLICY_ID = "suspense-boundaries-p2-41-v1" as const;

export const SUSPENSE_BOUNDARIES_P2_41_DOC = "docs/suspense-boundaries-p2-41.md" as const;

export const SUSPENSE_BOUNDARIES_P2_41_ARTIFACT =
  "artifacts/suspense-boundaries-p2-41.json" as const;

export const SUSPENSE_BOUNDARIES_P2_41_BOUNDARY_COMPONENT =
  "components/dashboard/suspense-wave1-page-boundary.tsx" as const;

export const SUSPENSE_BOUNDARIES_P2_41_CHECK_NPM_SCRIPT =
  "check:suspense-boundaries-p2-41" as const;

export const SUSPENSE_BOUNDARIES_P2_41_CI_NPM_SCRIPT =
  "test:ci:suspense-boundaries-p2-41" as const;

export const SUSPENSE_BOUNDARIES_P2_41_UNIT_TEST =
  "tests/unit/suspense-boundaries-p2-41.test.ts" as const;

export const SUSPENSE_BOUNDARIES_P2_41_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const SUSPENSE_WAVE_1_SECTORS = ["today", "marketplace", "pos", "kitchen"] as const;

export type SuspenseWave1Sector = (typeof SUSPENSE_WAVE_1_SECTORS)[number];

export type SuspenseWave1PageRoute = {
  id: string;
  pagePath: string;
  sector: SuspenseWave1Sector;
  skeleton: "TodaySkeleton" | "MarketplaceSkeleton" | "POSSkeleton" | "KDSSkeleton";
};

/** Wave 1 — 55 operator pages wrapped with Suspense + sector skeleton (P2-41). */
export const SUSPENSE_WAVE_1_PAGES: readonly SuspenseWave1PageRoute[] = [
  { id: "today-profit", pagePath: "app/dashboard/today/profit/page.tsx", sector: "today", skeleton: "TodaySkeleton" },
  { id: "marketplace-analytics", pagePath: "app/dashboard/marketplace/analytics/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-auto-vendor", pagePath: "app/dashboard/marketplace/auto-vendor/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-catalog", pagePath: "app/dashboard/marketplace/catalog/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-checkout", pagePath: "app/dashboard/marketplace/checkout/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-commission-model", pagePath: "app/dashboard/marketplace/commission-model/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-compare", pagePath: "app/dashboard/marketplace/compare/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-comparison-tool", pagePath: "app/dashboard/marketplace/comparison-tool/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-empty-states", pagePath: "app/dashboard/marketplace/empty-states/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-financing", pagePath: "app/dashboard/marketplace/financing/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-orders", pagePath: "app/dashboard/marketplace/orders/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-price-intelligence", pagePath: "app/dashboard/marketplace/price-intelligence/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-product-slug", pagePath: "app/dashboard/marketplace/products/[slug]/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-quality", pagePath: "app/dashboard/marketplace/quality/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-restaurant-purchasing", pagePath: "app/dashboard/marketplace/restaurant-purchasing/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-trust", pagePath: "app/dashboard/marketplace/trust/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-vendor-analytics", pagePath: "app/dashboard/marketplace/vendor-analytics/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-vendor-onboarding", pagePath: "app/dashboard/marketplace/vendor-onboarding/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-vendor-payout-webhook", pagePath: "app/dashboard/marketplace/vendor-payout-webhook/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-vendor-id", pagePath: "app/dashboard/marketplace/vendors/[id]/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-vendors", pagePath: "app/dashboard/marketplace/vendors/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "marketplace-wishlist", pagePath: "app/dashboard/marketplace/wishlist/page.tsx", sector: "marketplace", skeleton: "MarketplaceSkeleton" },
  { id: "pos-cafe", pagePath: "app/dashboard/pos/cafe/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-cash", pagePath: "app/dashboard/pos/cash/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-handheld", pagePath: "app/dashboard/pos/handheld/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-mobile", pagePath: "app/dashboard/pos/mobile/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-native-tablet", pagePath: "app/dashboard/pos/native-tablet/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-receipts", pagePath: "app/dashboard/pos/receipts/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-registers", pagePath: "app/dashboard/pos/registers/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-reports", pagePath: "app/dashboard/pos/reports/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-settings-hardware", pagePath: "app/dashboard/pos/settings/hardware/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-settings-offline", pagePath: "app/dashboard/pos/settings/offline/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-settings", pagePath: "app/dashboard/pos/settings/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-shifts", pagePath: "app/dashboard/pos/shifts/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-table-service", pagePath: "app/dashboard/pos/table-service/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-tablet", pagePath: "app/dashboard/pos/tablet/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-tabs", pagePath: "app/dashboard/pos/tabs/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-terminal-customer-display", pagePath: "app/dashboard/pos/terminal/customer-display/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "pos-transactions", pagePath: "app/dashboard/pos/transactions/page.tsx", sector: "pos", skeleton: "POSSkeleton" },
  { id: "kitchen-bump-recall-audit", pagePath: "app/dashboard/kitchen/bump-recall-audit/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-cameras-live", pagePath: "app/dashboard/kitchen/cameras/live/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-cameras", pagePath: "app/dashboard/kitchen/cameras/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-daisy-chain", pagePath: "app/dashboard/kitchen/daisy-chain/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-driver-eta", pagePath: "app/dashboard/kitchen/driver-eta/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-expedite", pagePath: "app/dashboard/kitchen/expedite/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-expo", pagePath: "app/dashboard/kitchen/expo/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-fullscreen", pagePath: "app/dashboard/kitchen/fullscreen/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-manager", pagePath: "app/dashboard/kitchen/manager/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-multi-station", pagePath: "app/dashboard/kitchen/multi-station/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-packing-verification", pagePath: "app/dashboard/kitchen/packing-verification/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-production", pagePath: "app/dashboard/kitchen/production/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-routing-rules", pagePath: "app/dashboard/kitchen/routing-rules/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-sla", pagePath: "app/dashboard/kitchen/sla/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-tablet", pagePath: "app/dashboard/kitchen/tablet/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
  { id: "kitchen-voice", pagePath: "app/dashboard/kitchen/voice/page.tsx", sector: "kitchen", skeleton: "KDSSkeleton" },
] as const;

/** Already wrapped before wave 1 — retained for full sector coverage audit. */
export const SUSPENSE_WAVE_1_BASELINE_PAGES = [
  "app/dashboard/today/page.tsx",
  "app/dashboard/marketplace/page.tsx",
  "app/dashboard/pos/page.tsx",
  "app/dashboard/pos/terminal/page.tsx",
  "app/dashboard/kitchen/page.tsx",
] as const;

export const SUSPENSE_BOUNDARIES_P2_41_WIRING_PATHS = [
  SUSPENSE_BOUNDARIES_P2_41_DOC,
  SUSPENSE_BOUNDARIES_P2_41_BOUNDARY_COMPONENT,
  SUSPENSE_BOUNDARIES_P2_41_ARTIFACT,
  SUSPENSE_BOUNDARIES_P2_41_UNIT_TEST,
  SUSPENSE_BOUNDARIES_P2_41_CI_WORKFLOW,
  "lib/testing/suspense-skeleton-policy.ts",
] as const;

export function pageHasSuspenseWave1Boundary(source: string): boolean {
  return (
    source.includes("SuspenseWave1PageBoundary") ||
    source.includes("<Suspense") ||
    source.includes(" Suspense ")
  );
}
