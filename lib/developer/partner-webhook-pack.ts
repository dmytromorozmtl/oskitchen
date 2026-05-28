/**
 * Partner webhook integration pack — Evolution Era 17 Workstream C Cycle 14.
 *
 * Single partner-readiness surface for inbound commerce webhooks + documented outbound taxonomy.
 * Does NOT claim production SLA, guaranteed delivery, or full outbound subscription platform.
 */

import { WEBHOOK_EVENT_TYPES } from "@/lib/developer/webhook-event-types";
import {
  PARTNER_WEBHOOK_ERA17_FORBIDDEN_CLAIMS,
  PARTNER_WEBHOOK_ERA17_INBOUND_COMMERCE_ROUTES,
  PARTNER_WEBHOOK_ERA17_POLICY_ID,
} from "@/lib/developer/partner-webhook-era17-policy";
import { WEBHOOK_RETRY_POLICY_NOTES } from "@/services/developer/webhook-contract-service";

export type PartnerWebhookChecklistItem = {
  id: string;
  task: string;
  verifyHow: string;
  integrationBlocker: boolean;
};

export type PartnerWebhookReadinessInput = {
  policyCertPass: boolean;
  webhookSecurityCertPass: boolean;
  partnerDocExists: boolean;
  contractMaturityDocExists: boolean;
  livePartnerAttestation?: boolean;
};

export type PartnerWebhookReadinessResult = {
  decision: "READY" | "NOT_READY" | "CONDITIONAL";
  blockers: string[];
  warnings: string[];
};

export type PartnerWebhookConfidenceSummary = {
  version: typeof PARTNER_WEBHOOK_ERA17_POLICY_ID;
  generatedAt: string;
  inboundCommerceRoutes: readonly (typeof PARTNER_WEBHOOK_ERA17_INBOUND_COMMERCE_ROUTES)[number][];
  outboundEventTypes: readonly string[];
  retryPolicyNotes: readonly string[];
  partnerChecklistCount: number;
  forbiddenClaimCount: number;
  readiness: PartnerWebhookReadinessResult;
};

export const PARTNER_WEBHOOK_CHECKLIST: readonly PartnerWebhookChecklistItem[] = [
  {
    id: "partner-inbound-url",
    task: "Register KitchenOS inbound webhook URL at Stripe / Woo / Shopify",
    verifyHow:
      "Stripe → /api/webhooks/stripe; Woo → /api/webhooks/woocommerce?cid=<connection-uuid>; Shopify → /api/webhooks/shopify/orders",
    integrationBlocker: true,
  },
  {
    id: "partner-signature-secret",
    task: "Align signature secrets between provider and KitchenOS integration settings",
    verifyHow:
      "Stripe signing secret; Woo webhook secret; Shopify app shared secret — invalid HMAC returns 401/400 fail-closed",
    integrationBlocker: true,
  },
  {
    id: "partner-tenant-mapping",
    task: "Confirm tenant routing (cid param or shop domain header)",
    verifyHow:
      "Woo uses ?cid= connection uuid; Shopify resolves X-Shopify-Shop-Domain; Stripe maps billing connection",
    integrationBlocker: true,
  },
  {
    id: "partner-idempotency",
    task: "Expect provider retries — duplicates must not double-create orders",
    verifyHow:
      "WebhookEvent.externalEventId dedupe; Woo delivery id; Shopify webhook id; see WEBHOOK_SECURITY.md",
    integrationBlocker: true,
  },
  {
    id: "partner-monitor",
    task: "Monitor webhook pipeline in Dashboard → Developer → Webhooks",
    verifyHow: "24h delivery/failure counts; signatureValid and processingError columns",
    integrationBlocker: false,
  },
  {
    id: "partner-incident-drill",
    task: "Walk commerce webhook incident drill before pilot go-live",
    verifyHow: "npm run smoke:commerce-webhook-drill — tabletop or staging attestation",
    integrationBlocker: false,
  },
  {
    id: "partner-public-api",
    task: "Optional: pair inbound webhooks with Public API v1 reads",
    verifyHow: "GET /api/openapi.json; npm run test:ci:public-api-v1:cert; per-route scopes enforced",
    integrationBlocker: false,
  },
  {
    id: "partner-honesty",
    task: "Review forbidden claims before partner contract or deck",
    verifyHow: "No production webhook SLA, guaranteed delivery, SOC2, or marketplace-live claims",
    integrationBlocker: true,
  },
];

export function evaluatePartnerWebhookReadiness(
  input: PartnerWebhookReadinessInput,
): PartnerWebhookReadinessResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.policyCertPass) {
    blockers.push("Partner webhook docs cert must pass (npm run test:ci:partner-webhook-docs-era17:cert).");
  }
  if (!input.webhookSecurityCertPass) {
    blockers.push("Webhook security cert must pass (npm run test:ci:webhook-security-era16:cert).");
  }
  if (!input.partnerDocExists) {
    blockers.push("Partner webhook integration doc missing (docs/partner-webhook-integration-era17.md).");
  }
  if (!input.contractMaturityDocExists) {
    blockers.push("API/webhook contract maturity doc missing.");
  }
  if (input.livePartnerAttestation === false) {
    warnings.push("Live partner onboarding attestation not recorded — pilot may proceed with engineering docs only.");
  }

  if (blockers.length > 0) {
    return { decision: "NOT_READY", blockers, warnings };
  }
  if (warnings.length > 0) {
    return { decision: "CONDITIONAL", blockers, warnings };
  }
  return { decision: "READY", blockers, warnings };
}

export function buildPartnerWebhookConfidenceSummary(
  input: PartnerWebhookReadinessInput,
  generatedAt: Date = new Date(),
): PartnerWebhookConfidenceSummary {
  return {
    version: PARTNER_WEBHOOK_ERA17_POLICY_ID,
    generatedAt: generatedAt.toISOString(),
    inboundCommerceRoutes: PARTNER_WEBHOOK_ERA17_INBOUND_COMMERCE_ROUTES,
    outboundEventTypes: WEBHOOK_EVENT_TYPES,
    retryPolicyNotes: WEBHOOK_RETRY_POLICY_NOTES,
    partnerChecklistCount: PARTNER_WEBHOOK_CHECKLIST.length,
    forbiddenClaimCount: PARTNER_WEBHOOK_ERA17_FORBIDDEN_CLAIMS.length,
    readiness: evaluatePartnerWebhookReadiness(input),
  };
}
