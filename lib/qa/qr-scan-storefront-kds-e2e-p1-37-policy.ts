/**
 * P1-37 — QR scan→storefront→KDS E2E: QR → checkout → WebhookEvent → KitchenTask.
 *
 * @see docs/qr-scan-storefront-kds-e2e-p1-37.md
 * @see e2e/qr-scan-storefront-kds-e2e.spec.ts
 */

export {
  QR_ORDERING_PAGE_TEST_ID,
  QR_SCAN_STOREFRONT_KDS_FLOW_STEPS,
  QR_SCAN_STOREFRONT_KDS_E2E_SPEC,
  QR_SCAN_STOREFRONT_KDS_E2E_FLOW_HELPER,
  QR_SCAN_STOREFRONT_KDS_E2E_READY_HELPER,
  QR_SCAN_STOREFRONT_KDS_E2E_AUDIT_SCRIPT,
  QR_SCAN_STOREFRONT_KDS_E2E_UNIT_TEST,
  qrScanEntryPath,
  storefrontMenuPath,
  storefrontCheckoutPath,
  hasQrScanStorefrontKdsE2ECredentials,
  isQrScanStorefrontKdsE2EEnabled,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-policy";

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_POLICY_ID =
  "qr-scan-storefront-kds-e2e-p1-37-v1" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_DOC =
  "docs/qr-scan-storefront-kds-e2e-p1-37.md" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_ARTIFACT =
  "artifacts/qr-scan-storefront-kds-e2e-p1-37.json" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_AUDIT_MODULE =
  "lib/qa/qr-scan-storefront-kds-e2e-p1-37-audit.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_SERVICE =
  "services/qa/qr-scan-storefront-kds-e2e-p1-37.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_SMOKE_SERVICE =
  "services/qa/qr-scan-storefront-kds-smoke.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHECK_NPM_SCRIPT =
  "check:qr-scan-storefront-kds-e2e-p1-37" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CI_NPM_SCRIPT =
  "test:ci:qr-scan-storefront-kds-e2e-p1-37" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_UNIT_TEST =
  "tests/unit/qr-scan-storefront-kds-e2e-p1-37.test.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_E2E_NPM_SCRIPT =
  "test:e2e:qr-scan-storefront-kds-e2e" as const;

/** Gap-closure chain: QR → checkout → webhook → kitchen task → KDS. */
export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CHAIN = [
  "qr",
  "checkout",
  "webhook_event",
  "kitchen_task",
] as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_REQUIRED_STEP_IDS = [
  "storefront_checkout",
  "webhook_event_persisted",
  "kitchen_task_linked",
  "kds_ticket_visible",
] as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_P1_37_WIRING_PATHS = [
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_DOC,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_AUDIT_MODULE,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_UNIT_TEST,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_ARTIFACT,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_CI_WORKFLOW,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_SERVICE,
  QR_SCAN_STOREFRONT_KDS_E2E_P1_37_SMOKE_SERVICE,
  "lib/qa/qr-scan-storefront-kds-e2e-policy.ts",
  "e2e/qr-scan-storefront-kds-e2e.spec.ts",
  "e2e/helpers/qr-scan-storefront-kds-e2e-flow.ts",
] as const;
