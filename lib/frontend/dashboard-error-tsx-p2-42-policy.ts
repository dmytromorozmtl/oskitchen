/**
 * P2-42 — error.tsx on 45 dashboard operator routes (Today, Marketplace, POS, Kitchen).
 *
 * @see docs/dashboard-error-tsx-p2-42.md
 */

export const DASHBOARD_ERROR_TSX_P2_42_POLICY_ID = "dashboard-error-tsx-p2-42-v1" as const;

export const DASHBOARD_ERROR_TSX_P2_42_DOC = "docs/dashboard-error-tsx-p2-42.md" as const;

export const DASHBOARD_ERROR_TSX_P2_42_ARTIFACT =
  "artifacts/dashboard-error-tsx-p2-42.json" as const;

export const DASHBOARD_ERROR_TSX_P2_42_CHECK_NPM_SCRIPT =
  "check:dashboard-error-tsx-p2-42" as const;

export const DASHBOARD_ERROR_TSX_P2_42_CI_NPM_SCRIPT =
  "test:ci:dashboard-error-tsx-p2-42" as const;

export const DASHBOARD_ERROR_TSX_P2_42_UNIT_TEST =
  "tests/unit/dashboard-error-tsx-p2-42.test.ts" as const;

export const DASHBOARD_ERROR_TSX_P2_42_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const DASHBOARD_ERROR_TSX_P2_42_TEMPLATE =
  "components/dashboard/error-boundary-template.tsx" as const;

export const DASHBOARD_ERROR_TSX_P2_42_TEMPLATE_MARKER = "ErrorBoundaryTemplate" as const;

export const DASHBOARD_ERROR_TSX_P2_42_SCAFFOLD_SCRIPT =
  "scripts/scaffold-dashboard-error-tsx-p2-42.ts" as const;

/** Wave-1 operator routes minus 10 marketplace admin/demo pages = 45 routes. */
export const DASHBOARD_ERROR_TSX_P2_42_EXCLUDED_MARKETPLACE_ADMIN = [
  "app/dashboard/marketplace/auto-vendor/page.tsx",
  "app/dashboard/marketplace/commission-model/page.tsx",
  "app/dashboard/marketplace/comparison-tool/page.tsx",
  "app/dashboard/marketplace/empty-states/page.tsx",
  "app/dashboard/marketplace/quality/page.tsx",
  "app/dashboard/marketplace/restaurant-purchasing/page.tsx",
  "app/dashboard/marketplace/trust/page.tsx",
  "app/dashboard/marketplace/vendor-analytics/page.tsx",
  "app/dashboard/marketplace/vendor-onboarding/page.tsx",
  "app/dashboard/marketplace/vendor-payout-webhook/page.tsx",
] as const;

export type DashboardErrorTsxP242Route = {
  id: string;
  pagePath: string;
  errorPath: string;
};

function toErrorRoute(id: string, pagePath: string): DashboardErrorTsxP242Route {
  return {
    id,
    pagePath,
    errorPath: pagePath.replace(/\/page\.tsx$/, "/error.tsx"),
  };
}

/** 45 pilot-critical operator routes requiring templated error.tsx (P2-42). */
export const DASHBOARD_ERROR_TSX_P2_42_ROUTES: readonly DashboardErrorTsxP242Route[] = [
  toErrorRoute("today-profit", "app/dashboard/today/profit/page.tsx"),
  toErrorRoute("marketplace-analytics", "app/dashboard/marketplace/analytics/page.tsx"),
  toErrorRoute("marketplace-catalog", "app/dashboard/marketplace/catalog/page.tsx"),
  toErrorRoute("marketplace-checkout", "app/dashboard/marketplace/checkout/page.tsx"),
  toErrorRoute("marketplace-compare", "app/dashboard/marketplace/compare/page.tsx"),
  toErrorRoute("marketplace-financing", "app/dashboard/marketplace/financing/page.tsx"),
  toErrorRoute("marketplace-orders", "app/dashboard/marketplace/orders/page.tsx"),
  toErrorRoute("marketplace-price-intelligence", "app/dashboard/marketplace/price-intelligence/page.tsx"),
  toErrorRoute("marketplace-product-slug", "app/dashboard/marketplace/products/[slug]/page.tsx"),
  toErrorRoute("marketplace-vendor-id", "app/dashboard/marketplace/vendors/[id]/page.tsx"),
  toErrorRoute("marketplace-vendors", "app/dashboard/marketplace/vendors/page.tsx"),
  toErrorRoute("marketplace-wishlist", "app/dashboard/marketplace/wishlist/page.tsx"),
  toErrorRoute("pos-cafe", "app/dashboard/pos/cafe/page.tsx"),
  toErrorRoute("pos-cash", "app/dashboard/pos/cash/page.tsx"),
  toErrorRoute("pos-handheld", "app/dashboard/pos/handheld/page.tsx"),
  toErrorRoute("pos-mobile", "app/dashboard/pos/mobile/page.tsx"),
  toErrorRoute("pos-native-tablet", "app/dashboard/pos/native-tablet/page.tsx"),
  toErrorRoute("pos-receipts", "app/dashboard/pos/receipts/page.tsx"),
  toErrorRoute("pos-registers", "app/dashboard/pos/registers/page.tsx"),
  toErrorRoute("pos-reports", "app/dashboard/pos/reports/page.tsx"),
  toErrorRoute("pos-settings-hardware", "app/dashboard/pos/settings/hardware/page.tsx"),
  toErrorRoute("pos-settings-offline", "app/dashboard/pos/settings/offline/page.tsx"),
  toErrorRoute("pos-settings", "app/dashboard/pos/settings/page.tsx"),
  toErrorRoute("pos-shifts", "app/dashboard/pos/shifts/page.tsx"),
  toErrorRoute("pos-table-service", "app/dashboard/pos/table-service/page.tsx"),
  toErrorRoute("pos-tablet", "app/dashboard/pos/tablet/page.tsx"),
  toErrorRoute("pos-tabs", "app/dashboard/pos/tabs/page.tsx"),
  toErrorRoute("pos-terminal-customer-display", "app/dashboard/pos/terminal/customer-display/page.tsx"),
  toErrorRoute("pos-transactions", "app/dashboard/pos/transactions/page.tsx"),
  toErrorRoute("kitchen-bump-recall-audit", "app/dashboard/kitchen/bump-recall-audit/page.tsx"),
  toErrorRoute("kitchen-cameras-live", "app/dashboard/kitchen/cameras/live/page.tsx"),
  toErrorRoute("kitchen-cameras", "app/dashboard/kitchen/cameras/page.tsx"),
  toErrorRoute("kitchen-daisy-chain", "app/dashboard/kitchen/daisy-chain/page.tsx"),
  toErrorRoute("kitchen-driver-eta", "app/dashboard/kitchen/driver-eta/page.tsx"),
  toErrorRoute("kitchen-expedite", "app/dashboard/kitchen/expedite/page.tsx"),
  toErrorRoute("kitchen-expo", "app/dashboard/kitchen/expo/page.tsx"),
  toErrorRoute("kitchen-fullscreen", "app/dashboard/kitchen/fullscreen/page.tsx"),
  toErrorRoute("kitchen-manager", "app/dashboard/kitchen/manager/page.tsx"),
  toErrorRoute("kitchen-multi-station", "app/dashboard/kitchen/multi-station/page.tsx"),
  toErrorRoute("kitchen-packing-verification", "app/dashboard/kitchen/packing-verification/page.tsx"),
  toErrorRoute("kitchen-production", "app/dashboard/kitchen/production/page.tsx"),
  toErrorRoute("kitchen-routing-rules", "app/dashboard/kitchen/routing-rules/page.tsx"),
  toErrorRoute("kitchen-sla", "app/dashboard/kitchen/sla/page.tsx"),
  toErrorRoute("kitchen-tablet", "app/dashboard/kitchen/tablet/page.tsx"),
  toErrorRoute("kitchen-voice", "app/dashboard/kitchen/voice/page.tsx"),
] as const;

export const DASHBOARD_ERROR_TSX_P2_42_ROUTE_COUNT = DASHBOARD_ERROR_TSX_P2_42_ROUTES.length;

export const DASHBOARD_ERROR_TSX_P2_42_WIRING_PATHS = [
  DASHBOARD_ERROR_TSX_P2_42_DOC,
  DASHBOARD_ERROR_TSX_P2_42_ARTIFACT,
  DASHBOARD_ERROR_TSX_P2_42_UNIT_TEST,
  DASHBOARD_ERROR_TSX_P2_42_TEMPLATE,
  DASHBOARD_ERROR_TSX_P2_42_SCAFFOLD_SCRIPT,
  DASHBOARD_ERROR_TSX_P2_42_CI_WORKFLOW,
  "lib/qa/dashboard-error-boundary-template-source.ts",
] as const;

export function dashboardErrorPathFromPage(pagePath: string): string {
  return pagePath.replace(/\/page\.tsx$/, "/error.tsx");
}

export function errorUsesBoundaryTemplate(source: string): boolean {
  return (
    source.includes(DASHBOARD_ERROR_TSX_P2_42_TEMPLATE_MARKER) &&
    source.includes("reset")
  );
}
