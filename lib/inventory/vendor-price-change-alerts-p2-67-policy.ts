/**
 * P2-67 — Vendor price change alerts: auto-alert on supplier price changes (MarginEdge parity).
 *
 * @see docs/vendor-price-change-alerts-p2-67.md
 */

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID =
  "vendor-price-change-alerts-p2-67-v1" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_DOC =
  "docs/vendor-price-change-alerts-p2-67.md" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_ARTIFACT =
  "artifacts/vendor-price-change-alerts-p2-67.json" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_PAGE =
  "app/dashboard/inventory/vendor-price-alerts/page.tsx" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL =
  "components/inventory/vendor-price-change-alerts-panel.tsx" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_BUILDER =
  "lib/inventory/vendor-price-change-alerts-p2-67-builder.ts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_SERVICE =
  "services/inventory/vendor-price-change-alerts-p2-67-service.ts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_PRICE_HISTORY_SERVICE =
  "services/purchasing/supplier-price-history-service.ts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_CORPUS_MODULE =
  "lib/inventory/vendor-price-change-alerts-p2-67-corpus.ts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCORING_MODULE =
  "lib/inventory/vendor-price-change-alerts-p2-67-scoring.ts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_AUDIT_MODULE =
  "lib/inventory/vendor-price-change-alerts-p2-67-audit.ts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_ROUTE =
  "/dashboard/inventory/vendor-price-alerts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_INTELLIGENCE_ROUTE =
  "/dashboard/inventory/vendor-price-intelligence" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL_TEST_ID =
  "vendor-price-change-alerts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_LIST_TEST_ID =
  "vendor-price-alert-list" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_SUMMARY_TEST_ID =
  "vendor-price-alert-summary" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCENARIO_COUNT = 12 as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_MIN_CAPABILITY_COVERAGE_PCT = 100 as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_DEFAULT_THRESHOLD_PCT = 5 as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_CHECK_NPM_SCRIPT =
  "check:vendor-price-change-alerts-p2-67" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_CI_NPM_SCRIPT =
  "test:ci:vendor-price-change-alerts-p2-67" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_UNIT_TEST =
  "tests/unit/vendor-price-change-alerts-p2-67.test.ts" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_FLOW_STEPS = [
  "price-history-ingest",
  "change-detection",
  "threshold-filter",
  "alert-digest",
] as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_ALERT_CAPABILITIES = [
  "detect_price_increase",
  "detect_price_decrease",
  "threshold_pct_alert",
  "supplier_scoped_alert",
  "ingredient_scoped_alert",
  "effective_date_tracking",
  "severity_classification",
  "alert_digest",
] as const;

export type VendorPriceAlertCapability =
  (typeof VENDOR_PRICE_CHANGE_ALERTS_P2_67_ALERT_CAPABILITIES)[number];

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_MARGINEDGE_PARITY_NOTE =
  "Auto-alerts when supplier unit costs change beyond a threshold — comparable to MarginEdge price change notifications, without claiming certified parity." as const;

export const VENDOR_PRICE_CHANGE_ALERTS_P2_67_WIRING_PATHS = [
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_DOC,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_ARTIFACT,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_CORPUS_MODULE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_SCORING_MODULE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_AUDIT_MODULE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_BUILDER,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_SERVICE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_PRICE_HISTORY_SERVICE,
  "services/purchasing/bulk-price-service.ts",
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_PAGE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_PANEL,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_UNIT_TEST,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_CI_WORKFLOW,
] as const;
