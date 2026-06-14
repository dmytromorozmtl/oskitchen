/**
 * P2-74 — QR ordering E2E: scan → storefront → WebhookEvent → KitchenTask → KDS.
 *
 * @see docs/qr-ordering-e2e-p2-74.md
 */

export const QR_ORDERING_E2E_P2_74_POLICY_ID = "qr-ordering-e2e-p2-74-v1" as const;

export const QR_ORDERING_E2E_P2_74_DOC = "docs/qr-ordering-e2e-p2-74.md" as const;

export const QR_ORDERING_E2E_P2_74_ARTIFACT = "artifacts/qr-ordering-e2e-p2-74.json" as const;

export const QR_ORDERING_E2E_P2_74_FLOW_MODULE =
  "lib/qr/qr-ordering-e2e-p2-74-flow.ts" as const;

export const QR_ORDERING_E2E_P2_74_SCORING_MODULE =
  "lib/qr/qr-ordering-e2e-p2-74-scoring.ts" as const;

export const QR_ORDERING_E2E_P2_74_AUDIT_MODULE =
  "lib/qr/qr-ordering-e2e-p2-74-audit.ts" as const;

export const QR_ORDERING_E2E_P2_74_PANEL =
  "components/qr/qr-ordering-e2e-panel.tsx" as const;

export const QR_ORDERING_E2E_P2_74_DASHBOARD_PAGE = "app/dashboard/qr-codes/page.tsx" as const;

export const QR_ORDERING_E2E_P2_74_CHECK_NPM_SCRIPT = "check:qr-ordering-e2e-p2-74" as const;

export const QR_ORDERING_E2E_P2_74_CI_NPM_SCRIPT = "test:ci:qr-ordering-e2e-p2-74" as const;

export const QR_ORDERING_E2E_P2_74_UNIT_TEST = "tests/unit/qr-ordering-e2e-p2-74.test.ts" as const;

export const QR_ORDERING_E2E_P2_74_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const QR_ORDERING_E2E_P2_74_PANEL_TEST_ID = "qr-ordering-e2e-panel" as const;

export const QR_ORDERING_E2E_P2_74_SCAN_CHANNEL_TEST_ID =
  "qr-ordering-e2e-scan-channel" as const;

export const QR_ORDERING_E2E_P2_74_KDS_CHANNEL_TEST_ID = "qr-ordering-e2e-kds-channel" as const;

export const QR_ORDERING_E2E_P2_74_SCENARIO_COUNT = 6 as const;

/** Full QR ordering chain: scan → checkout → webhook → kitchen task → KDS. */
export const QR_ORDERING_E2E_P2_74_FULL_CHAIN = [
  "qr_scan",
  "storefront_checkout",
  "webhook_event",
  "kitchen_task",
  "kds_ticket",
] as const;

export const QR_ORDERING_E2E_P2_74_UPSTREAM_POLICIES = [
  "qr-scan-storefront-kds-e2e-p1-37-v1",
  "qr-scan-storefront-kds-e2e-p2-32-v1",
] as const;

export const QR_ORDERING_E2E_P2_74_WIRING_PATHS = [
  QR_ORDERING_E2E_P2_74_DOC,
  QR_ORDERING_E2E_P2_74_ARTIFACT,
  QR_ORDERING_E2E_P2_74_FLOW_MODULE,
  QR_ORDERING_E2E_P2_74_SCORING_MODULE,
  QR_ORDERING_E2E_P2_74_AUDIT_MODULE,
  QR_ORDERING_E2E_P2_74_PANEL,
  QR_ORDERING_E2E_P2_74_DASHBOARD_PAGE,
  QR_ORDERING_E2E_P2_74_UNIT_TEST,
  QR_ORDERING_E2E_P2_74_CI_WORKFLOW,
  "lib/qa/qr-scan-storefront-kds-e2e-p1-37-policy.ts",
  "lib/qa/qr-scan-storefront-kds-e2e-policy.ts",
  "services/qr/qr-ordering-service.ts",
  "components/qr/qr-ordering-client.tsx",
  "app/api/public/qr-order/route.ts",
  "e2e/qr-scan-storefront-kds-e2e.spec.ts",
  "services/qa/qr-scan-storefront-kds-e2e-p1-37.ts",
] as const;
