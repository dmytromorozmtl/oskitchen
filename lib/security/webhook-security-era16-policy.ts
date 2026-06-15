/**
 * Webhook security matrix — Evolution Era 16 Cycle 6.
 *
 * Inventories webhook ingress routes, classifies signature/replay/tenant risk,
 * and surfaces high-risk next actions. Does NOT claim full replay monitoring ops.
 */

export const WEBHOOK_SECURITY_ERA16_POLICY_ID = "era16-webhook-security-matrix-v1" as const;

export const WEBHOOK_SECURITY_ERA16_DECISION_DATE = "2026-05-28" as const;

export const WEBHOOK_SECURITY_ERA16_EXTENDS_POLICIES = [
  "era4-channel-golden-path-v1",
  "era16-channel-live-smoke-v1",
] as const;

export const WEBHOOK_SECURITY_ERA16_MATRIX_MODULE =
  "lib/security/webhook-security-matrix.ts" as const;

export const WEBHOOK_SECURITY_ERA16_CERT_SCRIPT =
  "scripts/cert-webhook-security-era16.ts" as const;

export const WEBHOOK_SECURITY_ERA16_SUMMARY_ARTIFACT =
  "artifacts/webhook-security-matrix-summary.json" as const;

export const WEBHOOK_SECURITY_ERA16_ROUTE_COUNT = 46 as const;

export const WEBHOOK_SECURITY_ERA16_COMMERCE_ROUTES = [
  "/api/webhooks/stripe",
  "/api/webhooks/woocommerce",
  "/api/webhooks/shopify/orders-create",
  "/api/webhooks/shopify/orders-updated",
  "/api/webhooks/shopify/products-update",
  "/api/webhooks/shopify/app-uninstalled",
] as const;

export const WEBHOOK_SECURITY_ERA16_HONEST_SCOPE = {
  allRoutesInventoried: true,
  fullReplayMonitoringOps: false,
  invalidSignatureTestsForAllRoutes: false,
  commerceRoutesClassified: true,
} as const;

export const WEBHOOK_SECURITY_ERA16_PILOT_RUNBOOK_STEPS = [
  "Run npm run test:ci:webhook-security-era16:cert — matrix matches disk (46 routes).",
  "Run npm run cert:webhook-security-era16 — writes artifacts/webhook-security-matrix-summary.json.",
  "Review P0/P1 routes: Stripe, WooCommerce, Shopify, Resend, Uber Eats, Uber Direct.",
  "Commerce routes must have signature validation + replay/idempotency classification.",
  "Experimental/regulatory bearer routes remain P3 — not production commerce claims.",
  "Do not claim centralized replay monitoring ops until hardening cycles complete.",
] as const;

export const WEBHOOK_SECURITY_ERA16_REVIEW_SECTION =
  "Era 16 webhook security matrix (2026-05-28)" as const;

export const WEBHOOK_SECURITY_ERA16_CANONICAL_MARKERS = [
  WEBHOOK_SECURITY_ERA16_POLICY_ID,
  WEBHOOK_SECURITY_ERA16_MATRIX_MODULE,
  "webhook-security-matrix-summary",
  "46 webhook routes",
  "signature validation",
  "replay protection",
] as const;

export const WEBHOOK_SECURITY_ERA16_FORBIDDEN_CLAIMS = [
  "full webhook replay monitoring",
  "all webhook routes penetration tested",
  "zero webhook abuse risk",
] as const;

export const WEBHOOK_SECURITY_ERA16_CI_SCRIPTS = [
  "test:ci:webhook-security-era16",
  "test:ci:webhook-security-era16:cert",
] as const;

export const WEBHOOK_SECURITY_ERA16_UNIT_TESTS = [
  "tests/unit/webhook-security-matrix.test.ts",
  "tests/unit/webhook-security-era16-policy.test.ts",
  "tests/unit/webhook-security-era16-cert-live.test.ts",
  "tests/unit/webhook-scim-bearer.test.ts",
] as const;

export const WEBHOOK_SECURITY_ERA16_CANONICAL_DOC_PATHS = [
  "docs/cron-webhook-surface.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/feature-maturity-matrix.md",
  "docs/enterprise-procurement-pack.md",
  "docs/commercial-pilot-runbook.md",
] as const;
