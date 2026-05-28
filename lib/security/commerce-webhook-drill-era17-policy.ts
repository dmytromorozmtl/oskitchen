/**
 * Commerce webhook incident drill — Evolution Era 17 Workstream C Cycle 12.
 *
 * Operator checklist for Stripe / WooCommerce / Shopify webhook incidents.
 * Does NOT claim full webhook replay monitoring ops or live marketplace integrations.
 */

import { WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID } from "@/lib/security/webhook-replay-p1-expansion-era17-policy";
import { WEBHOOK_SECURITY_ERA16_POLICY_ID } from "@/lib/security/webhook-security-era16-policy";

export const COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID =
  "era17-commerce-webhook-drill-v1" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_DECISION_DATE = "2026-05-28" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_EXTENDS_POLICIES = [
  WEBHOOK_SECURITY_ERA16_POLICY_ID,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID,
] as const;

/** Drill not executed on staging/tabletop — template until operator attestation. */
export const COMMERCE_WEBHOOK_DRILL_ERA17_PROOF_STATUS =
  "awaiting_commerce_webhook_drill_execution" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_PROVIDERS = [
  "stripe",
  "woocommerce",
  "shopify",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_PROVIDER_ROUTES = [
  { provider: "stripe", apiPath: "/api/webhooks/stripe", signatureKind: "stripe_construct_event" },
  {
    provider: "woocommerce",
    apiPath: "/api/webhooks/woocommerce",
    signatureKind: "woocommerce_hmac",
  },
  {
    provider: "shopify",
    apiPath: "/api/webhooks/shopify/orders",
    signatureKind: "shopify_hmac",
  },
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_DOC =
  "docs/commerce-webhook-incident-drill-era17.md" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-commerce-webhook-drill-era17.ts" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_SUMMARY_ARTIFACT =
  "artifacts/commerce-webhook-drill-summary.json" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_NPM_SCRIPT = "smoke:commerce-webhook-drill" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_DRILL_MODES = ["tabletop", "staging"] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_ENV_VARS = [
  "COMMERCE_WEBHOOK_DRILL_MODE",
  "COMMERCE_WEBHOOK_DRILL_OPERATOR_EMAIL",
  "COMMERCE_WEBHOOK_DRILL_STAGING_URL",
  "COMMERCE_WEBHOOK_DRILL_INCIDENT_PROVIDER",
  "COMMERCE_WEBHOOK_DRILL_INCIDENT_SUMMARY",
  "COMMERCE_WEBHOOK_DRILL_POSTMORTEM",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Identify failing commerce webhook provider (Stripe / Woo / Shopify) and route from matrix.",
  "Verify signature secret alignment (Stripe signing secret, Woo consumer secret, Shopify HMAC).",
  "Check webhook URL, TLS, and tenant mapping (shop domain / connection id).",
  "Contain duplicate or replay storms — confirm ingress dedupe / webhook_event_store behavior.",
  "Pause integration or rotate secrets; validate invalid signature returns 401/400 without order side effects.",
  "Re-enable and confirm one test event reaches order hub; record postmortem.",
  "Run npm run smoke:commerce-webhook-drill — review artifacts/commerce-webhook-drill-summary.json.",
  "Do not claim full webhook replay monitoring ops or live marketplace delivery.",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_CANONICAL_MARKERS = [
  COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID,
  "smoke:commerce-webhook-drill",
  "awaiting_commerce_webhook_drill_execution",
  "commerceWebhookProofStatus",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_FORBIDDEN_CLAIMS = [
  "Do not claim centralized replay monitoring ops",
  "all commerce webhooks incident certified",
  "live marketplace integrations",
  "zero webhook incident risk",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_CI_SCRIPTS = [
  "test:ci:commerce-webhook-drill-era17",
  "test:ci:commerce-webhook-drill-era17:cert",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_UNIT_TESTS = [
  "tests/unit/commerce-webhook-drill-era17-policy.test.ts",
  "tests/unit/commerce-webhook-drill-summary.test.ts",
  "tests/unit/commerce-webhook-drill-era17-cert-live.test.ts",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_CANONICAL_DOC_PATHS = [
  COMMERCE_WEBHOOK_DRILL_ERA17_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/cron-webhook-surface.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_REVIEW_SECTION =
  "Era 17 commerce webhook incident drill (2026-05-28)" as const;

export const COMMERCE_WEBHOOK_DRILL_ERA17_BACKLOG_ID = "KOS-E17-021" as const;
