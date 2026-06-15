/**
 * Absolute Final Task 55 — integration smoke suite: 18 LIVE round-trip order→KDS.
 *
 * 6 channel webhooks → ExternalOrder → KDS
 * 3 payment rails → internal order → KDS
 * 8 sync-only LIVE integrations (honest skip — no kitchen ticket)
 * 1 Integration Health + KDS board probe
 *
 * @see scripts/smoke-integration-suite-order-kds.ts
 * @see lib/integrations/live-integrations-staging-smoke-policy.ts
 */

import { LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET } from "@/lib/integrations/live-integrations-staging-smoke-policy";
import { LIVE_INTEGRATION_REGISTRY_LIVE_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import { STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS } from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID =
  "integration-smoke-suite-order-kds-absolute-final-v1" as const;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_SUMMARY_ARTIFACT =
  "artifacts/integration-smoke-suite-order-kds-summary.json" as const;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_ORCHESTRATOR =
  "scripts/smoke-integration-suite-order-kds.ts" as const;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_OPS_DOC =
  "docs/integration-smoke-suite-order-kds-setup.md" as const;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_WORKFLOW =
  ".github/workflows/integration-smoke-suite-order-kds.yml" as const;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_E2E_SPEC =
  "e2e/integration-smoke-suite-order-kds.spec.ts" as const;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_KDS_PATH =
  "/dashboard/kitchen" as const;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_SLA_MS =
  STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT =
  LIVE_INTEGRATION_REGISTRY_LIVE_COUNT + 1;

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_CI_SCRIPTS = [
  "test:ci:integration-smoke-suite-order-kds",
  "test:ci:integration-smoke-suite-order-kds:cert",
  "smoke:integration-suite-order-kds",
] as const;

export type IntegrationSmokeSuiteRoundTripKind =
  | "channel_order_kds"
  | "payment_order_kds"
  | "sync_only"
  | "kds_board_probe";

export type IntegrationSmokeSuiteOrderKdsEntry = {
  integrationId: string;
  name: string;
  roundTripKind: IntegrationSmokeSuiteRoundTripKind;
  smokeScript: string | null;
  kdsVerification: "ticket_within_15s" | "external_order_import" | "not_applicable";
  roundTripSteps: readonly string[];
  nativeE2eSpec?: string;
};

const stagingScriptById = new Map(
  LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET.map((row) => [row.integrationId, row.smokeScript]),
);

export const INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET: readonly IntegrationSmokeSuiteOrderKdsEntry[] =
  [
    {
      integrationId: "woocommerce",
      name: "WooCommerce",
      roundTripKind: "channel_order_kds",
      smokeScript: stagingScriptById.get("woocommerce") ?? "smoke:woo-live",
      kdsVerification: "external_order_import",
      roundTripSteps: [
        "REST/webhook order ingest",
        "ExternalOrder row",
        "KDS ticket import",
        "Inventory sync",
      ],
      nativeE2eSpec: "e2e/woocommerce-webhook-order-hub.spec.ts",
    },
    {
      integrationId: "shopify",
      name: "Shopify",
      roundTripKind: "channel_order_kds",
      smokeScript: stagingScriptById.get("shopify") ?? "smoke:shopify-live",
      kdsVerification: "external_order_import",
      roundTripSteps: ["orders/create webhook", "ExternalOrder", "KDS import", "Inventory sync"],
    },
    {
      integrationId: "uber-eats",
      name: "Uber Eats",
      roundTripKind: "channel_order_kds",
      smokeScript: stagingScriptById.get("uber-eats") ?? "smoke:uber-eats-live",
      kdsVerification: "external_order_import",
      roundTripSteps: ["OAuth", "Signed orders webhook", "KDS import", "Status sync"],
    },
    {
      integrationId: "doordash",
      name: "DoorDash",
      roundTripKind: "channel_order_kds",
      smokeScript: stagingScriptById.get("doordash") ?? "smoke:doordash-live",
      kdsVerification: "external_order_import",
      roundTripSteps: ["Drive API/webhook", "ExternalOrder", "KDS import", "Status sync"],
    },
    {
      integrationId: "grubhub",
      name: "Grubhub",
      roundTripKind: "channel_order_kds",
      smokeScript: stagingScriptById.get("grubhub") ?? "smoke:grubhub-live",
      kdsVerification: "external_order_import",
      roundTripSteps: ["Marketplace webhook", "ExternalOrder", "KDS import", "Status sync"],
    },
    {
      integrationId: "skip",
      name: "Skip / Just Eat",
      roundTripKind: "channel_order_kds",
      smokeScript: stagingScriptById.get("skip") ?? "smoke:skip-live",
      kdsVerification: "external_order_import",
      roundTripSteps: ["OAuth/webhook", "ExternalOrder", "KDS import", "Status sync"],
    },
    {
      integrationId: "stripe",
      name: "Stripe",
      roundTripKind: "payment_order_kds",
      smokeScript: stagingScriptById.get("stripe") ?? "smoke:stripe-live",
      kdsVerification: "ticket_within_15s",
      roundTripSteps: ["PaymentIntent webhook", "Internal order", "KDS ticket"],
      nativeE2eSpec: "e2e/stripe-terminal-payment.spec.ts",
    },
    {
      integrationId: "square-payments",
      name: "Square Payments",
      roundTripKind: "payment_order_kds",
      smokeScript: stagingScriptById.get("square-payments") ?? "smoke:square-payments-live",
      kdsVerification: "ticket_within_15s",
      roundTripSteps: ["Payment webhook", "Internal order", "KDS ticket"],
    },
    {
      integrationId: "moneris",
      name: "Moneris",
      roundTripKind: "payment_order_kds",
      smokeScript: stagingScriptById.get("moneris") ?? "smoke:moneris-live",
      kdsVerification: "ticket_within_15s",
      roundTripSteps: ["Payment callback", "Internal order", "KDS ticket"],
    },
    {
      integrationId: "quickbooks",
      name: "QuickBooks",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("quickbooks") ?? "smoke:quickbooks-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["OAuth", "Journal sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "xero",
      name: "Xero",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("xero") ?? "smoke:xero-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["OAuth", "Ledger sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "7shifts",
      name: "7shifts",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("7shifts") ?? "smoke:seven-shifts-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["Staff roster sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "homebase",
      name: "Homebase",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("homebase") ?? "smoke:homebase-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["Labour sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "klaviyo",
      name: "Klaviyo",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("klaviyo") ?? "smoke:klaviyo-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["Audience sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "mailchimp",
      name: "Mailchimp",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("mailchimp") ?? "smoke:mailchimp-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["List sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "opentable",
      name: "OpenTable",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("opentable") ?? "smoke:opentable-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["Reservation sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "resy",
      name: "Resy",
      roundTripKind: "sync_only",
      smokeScript: stagingScriptById.get("resy") ?? "smoke:resy-live",
      kdsVerification: "not_applicable",
      roundTripSteps: ["Reservation sync", "No KDS ticket (honest skip)"],
    },
    {
      integrationId: "integration-health",
      name: "Integration Health + KDS board",
      roundTripKind: "kds_board_probe",
      smokeScript: null,
      kdsVerification: "ticket_within_15s",
      roundTripSteps: [
        "Integration Health LIVE dashboard",
        "KDS board reachable",
        "Ticket SLA ≤15s on native paths",
      ],
      nativeE2eSpec: "e2e/kds-staging.spec.ts",
    },
  ] as const;

export const INTEGRATION_SMOKE_SUITE_NATIVE_ORDER_KDS_E2E_SPECS = [
  "e2e/kds-staging.spec.ts",
  "e2e/storefront-checkout-kds.spec.ts",
  "e2e/qr-guest-order-kitchen.spec.ts",
  "e2e/pos-checkout-flow.spec.ts",
] as const;

export function integrationSmokeSuiteOrderKdsIds(): string[] {
  return INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET.map((entry) => entry.integrationId);
}

export function integrationSmokeSuiteChannelOrderKdsCount(): number {
  return INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET.filter(
    (entry) => entry.roundTripKind === "channel_order_kds",
  ).length;
}

export function integrationSmokeSuiteRequiresKdsTicket(
  entry: Pick<IntegrationSmokeSuiteOrderKdsEntry, "roundTripKind">,
): boolean {
  return entry.roundTripKind === "channel_order_kds" || entry.roundTripKind === "payment_order_kds";
}
