/**
 * Blueprint P3-52 — 30 critical pages button-by-button regression suite.
 *
 * @see e2e/button-regression-p3-52.spec.ts
 * @see docs/button-regression-p3-52.md
 */

export const BUTTON_REGRESSION_P3_52_POLICY_ID = "button-regression-p3-52-v1" as const;

export const BUTTON_REGRESSION_P3_52_DOC = "docs/button-regression-p3-52.md" as const;

export const BUTTON_REGRESSION_P3_52_ARTIFACT =
  "artifacts/button-regression-p3-52-registry.json" as const;

export const BUTTON_REGRESSION_P3_52_SPEC = "e2e/button-regression-p3-52.spec.ts" as const;

export const BUTTON_REGRESSION_P3_52_FLOW_HELPER =
  "e2e/helpers/button-regression-p3-52-flow.ts" as const;

export const BUTTON_REGRESSION_P3_52_READY_HELPER =
  "e2e/helpers/button-regression-p3-52-ready.ts" as const;

export const BUTTON_REGRESSION_P3_52_AUDIT_SCRIPT =
  "scripts/audit-button-regression-p3-52.ts" as const;

export const BUTTON_REGRESSION_P3_52_NPM_SCRIPT = "audit:button-regression-p3-52" as const;

export const BUTTON_REGRESSION_P3_52_CHECK_NPM_SCRIPT = "check:button-regression-p3-52" as const;

export const BUTTON_REGRESSION_P3_52_UNIT_TEST =
  "tests/unit/button-regression-p3-52.test.ts" as const;

export const BUTTON_REGRESSION_P3_52_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT = 30 as const;

export const BUTTON_REGRESSION_P3_52_FLOW_STEPS = [
  "validate_button_regression_contract",
  "authed_page_button_smoke",
] as const;

/** Pilot-critical dashboard routes (first 30 from authed RSC smoke registry). */
export const BUTTON_REGRESSION_P3_52_CRITICAL_PAGES = [
  { id: "today", path: "/dashboard/today", label: "Today command center" },
  { id: "menus", path: "/dashboard/menus", label: "Menus hub" },
  { id: "marketplace", path: "/dashboard/marketplace", label: "Marketplace home" },
  { id: "marketplace-catalog", path: "/dashboard/marketplace/catalog", label: "Marketplace catalog" },
  { id: "marketplace-orders", path: "/dashboard/marketplace/orders", label: "Marketplace orders" },
  { id: "marketplace-wishlist", path: "/dashboard/marketplace/wishlist", label: "Marketplace wishlist" },
  { id: "marketplace-compare", path: "/dashboard/marketplace/compare", label: "Marketplace compare" },
  { id: "marketplace-vendors", path: "/dashboard/marketplace/vendors", label: "Marketplace vendors" },
  { id: "marketplace-analytics", path: "/dashboard/marketplace/analytics", label: "Marketplace analytics" },
  { id: "pos-terminal", path: "/dashboard/pos/terminal", label: "POS terminal" },
  { id: "pos-tablet", path: "/dashboard/pos/tablet", label: "POS tablet" },
  { id: "pos-mobile", path: "/dashboard/pos/mobile", label: "POS mobile" },
  { id: "pos-handheld", path: "/dashboard/pos/handheld", label: "POS handheld" },
  { id: "pos-cash", path: "/dashboard/pos/cash", label: "POS cash drawer" },
  { id: "kitchen", path: "/dashboard/kitchen", label: "Kitchen display" },
  { id: "kitchen-production", path: "/dashboard/kitchen/production", label: "Kitchen production" },
  { id: "kitchen-expo", path: "/dashboard/kitchen/expo", label: "Kitchen expo" },
  { id: "kitchen-manager", path: "/dashboard/kitchen/manager", label: "Kitchen manager" },
  { id: "quick-start", path: "/dashboard/quick-start", label: "Quick start wizard" },
  { id: "qr-codes", path: "/dashboard/qr-codes", label: "QR codes" },
  { id: "today-profit", path: "/dashboard/today/profit", label: "Today profit engine" },
  { id: "ai-co-pilot", path: "/dashboard/ai/co-pilot", label: "AI co-pilot" },
  { id: "enterprise-multi-location", path: "/dashboard/enterprise/multi-location", label: "Multi-location" },
  { id: "enterprise-multi-brand", path: "/dashboard/enterprise/multi-brand", label: "Multi-brand" },
  { id: "enterprise-commissary", path: "/dashboard/enterprise/commissary", label: "Commissary hub" },
  { id: "enterprise-reports", path: "/dashboard/enterprise/reports", label: "Enterprise reports" },
  { id: "catering", path: "/dashboard/catering", label: "Catering hub" },
  { id: "meal-prep", path: "/dashboard/meal-prep", label: "Meal prep hub" },
  { id: "loyalty-program-builder", path: "/dashboard/loyalty/program-builder", label: "Loyalty program builder" },
  { id: "loyalty-gift-cards", path: "/dashboard/loyalty/gift-cards", label: "Gift cards" },
] as const;

export type ButtonRegressionCriticalPageId =
  (typeof BUTTON_REGRESSION_P3_52_CRITICAL_PAGES)[number]["id"];

export const BUTTON_REGRESSION_P3_52_WIRING_PATHS = [
  BUTTON_REGRESSION_P3_52_DOC,
  "lib/qa/button-regression-p3-52-measurement.ts",
  "lib/qa/button-regression-p3-52-audit.ts",
  BUTTON_REGRESSION_P3_52_SPEC,
  BUTTON_REGRESSION_P3_52_FLOW_HELPER,
  BUTTON_REGRESSION_P3_52_READY_HELPER,
  BUTTON_REGRESSION_P3_52_UNIT_TEST,
  BUTTON_REGRESSION_P3_52_ARTIFACT,
] as const;

export function isButtonRegressionP3_52Enabled(): boolean {
  return process.env.E2E_BUTTON_REGRESSION_P3_52?.trim() === "true";
}

export function hasButtonRegressionP3_52Credentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function buttonRegressionCriticalPageIds(): ButtonRegressionCriticalPageId[] {
  return BUTTON_REGRESSION_P3_52_CRITICAL_PAGES.map((page) => page.id);
}
