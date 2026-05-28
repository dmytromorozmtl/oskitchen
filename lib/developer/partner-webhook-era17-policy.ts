/**
 * Partner webhook integration docs — Evolution Era 17 Workstream C Cycle 14.
 *
 * Partner-facing inbound webhook contract + outbound event taxonomy.
 * Does NOT claim production webhook SLA, guaranteed delivery, or SOC2 certification.
 */

import { COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID } from "@/lib/security/commerce-webhook-drill-era17-policy";
import { WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID } from "@/lib/security/webhook-replay-p1-expansion-era17-policy";
import { WEBHOOK_SECURITY_ERA16_POLICY_ID } from "@/lib/security/webhook-security-era16-policy";

export const PARTNER_WEBHOOK_ERA17_POLICY_ID = "era17-partner-webhook-docs-v1" as const;

export const PARTNER_WEBHOOK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PARTNER_WEBHOOK_ERA17_EXTENDS_POLICIES = [
  WEBHOOK_SECURITY_ERA16_POLICY_ID,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID,
  COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID,
  "era16-public-api-partner-confidence-v1",
] as const;

/** Partner doc + cert wired — live partner onboarding optional. */
export const PARTNER_WEBHOOK_ERA17_PROOF_STATUS = "partner_webhook_docs_ready" as const;

export const PARTNER_WEBHOOK_ERA17_PARTNER_DOC =
  "docs/partner-webhook-integration-era17.md" as const;

export const PARTNER_WEBHOOK_ERA17_CONTRACT_MATURITY_DOC =
  "docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md" as const;

export const PARTNER_WEBHOOK_ERA17_PACK_MODULE =
  "lib/developer/partner-webhook-pack.ts" as const;

export const PARTNER_WEBHOOK_ERA17_SUMMARY_MODULE =
  "lib/developer/partner-webhook-summary.ts" as const;

export const PARTNER_WEBHOOK_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-partner-webhook-docs-era17.ts" as const;

export const PARTNER_WEBHOOK_ERA17_SUMMARY_ARTIFACT =
  "artifacts/partner-webhook-docs-summary.json" as const;

export const PARTNER_WEBHOOK_ERA17_NPM_SCRIPT = "smoke:partner-webhook-docs" as const;

/** Pilot commerce inbound routes partners configure at providers. */
export const PARTNER_WEBHOOK_ERA17_INBOUND_COMMERCE_ROUTES = [
  {
    provider: "stripe",
    apiPath: "/api/webhooks/stripe",
    signatureKind: "stripe_construct_event",
    tenantMapping: "Stripe account id on billing connection",
  },
  {
    provider: "woocommerce",
    apiPath: "/api/webhooks/woocommerce",
    signatureKind: "woocommerce_hmac",
    tenantMapping: "cid query param (connection uuid)",
  },
  {
    provider: "shopify",
    apiPath: "/api/webhooks/shopify/orders",
    signatureKind: "shopify_hmac",
    tenantMapping: "X-Shopify-Shop-Domain header",
  },
] as const;

export const PARTNER_WEBHOOK_ERA17_PARTNER_CHECKLIST_IDS = [
  "partner-inbound-url",
  "partner-signature-secret",
  "partner-tenant-mapping",
  "partner-idempotency",
  "partner-monitor",
  "partner-incident-drill",
  "partner-public-api",
  "partner-honesty",
] as const;

export const PARTNER_WEBHOOK_ERA17_SUPPORT_DOCS = [
  PARTNER_WEBHOOK_ERA17_PARTNER_DOC,
  PARTNER_WEBHOOK_ERA17_CONTRACT_MATURITY_DOC,
  "docs/WEBHOOK_SECURITY.md",
  "docs/INTEGRATIONS_ARCHITECTURE.md",
  "docs/commerce-webhook-incident-drill-era17.md",
  "docs/channel-pilot-playbook-era17.md",
] as const;

export const PARTNER_WEBHOOK_ERA17_CANONICAL_MARKERS = [
  PARTNER_WEBHOOK_ERA17_POLICY_ID,
  "smoke:partner-webhook-docs",
  "partner_webhook_docs_ready",
  "partner-webhook-docs-summary",
  "partnerWebhookProofStatus",
] as const;

export const PARTNER_WEBHOOK_ERA17_FORBIDDEN_CLAIMS = [
  "production webhook SLA",
  "guaranteed webhook delivery",
  "SOC2 webhook certification",
  "full outbound webhook subscription platform",
  "zero webhook incident risk",
  "live marketplace integrations",
] as const;

export const PARTNER_WEBHOOK_ERA17_CI_SCRIPTS = [
  "test:ci:partner-webhook-docs-era17",
  "test:ci:partner-webhook-docs-era17:cert",
] as const;

export const PARTNER_WEBHOOK_ERA17_UNIT_TESTS = [
  "tests/unit/partner-webhook-era17-policy.test.ts",
  "tests/unit/partner-webhook-pack.test.ts",
  "tests/unit/partner-webhook-summary.test.ts",
  "tests/unit/partner-webhook-docs-era17-cert-live.test.ts",
] as const;

export const PARTNER_WEBHOOK_ERA17_CANONICAL_DOC_PATHS = [
  PARTNER_WEBHOOK_ERA17_PARTNER_DOC,
  PARTNER_WEBHOOK_ERA17_CONTRACT_MATURITY_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/cron-webhook-surface.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const PARTNER_WEBHOOK_ERA17_REVIEW_SECTION =
  "Era 17 partner webhook integration docs (2026-05-28)" as const;

export const PARTNER_WEBHOOK_ERA17_BACKLOG_ID = "KOS-E17-026" as const;
