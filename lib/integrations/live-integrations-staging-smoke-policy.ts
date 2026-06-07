/**
 * Absolute Final Task 16 — fleet policy for 18 LIVE integration staging smokes.
 *
 * 17 LIVE providers (merchant credentials via `.env.smoke.local` / staging vault)
 * + Integration Health dashboard staging reachability probe.
 */

import { DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT } from "@/lib/integrations/doordash-live-smoke-era77-policy";
import { GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT } from "@/lib/integrations/grubhub-live-smoke-era78-policy";
import {
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_INTEGRATION_HEALTH_PATH,
} from "@/lib/integrations/integration-health-live-smoke-era166-policy";
import { LIVE_INTEGRATION_REGISTRY_LIVE_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import { HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT } from "@/lib/integrations/homebase-live-smoke-era83-policy";
import { KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT } from "@/lib/integrations/klaviyo-live-smoke-era84-policy";
import { MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT } from "@/lib/integrations/mailchimp-live-smoke-era85-policy";
import { MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT } from "@/lib/integrations/moneris-live-smoke-era88-policy";
import { OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT } from "@/lib/integrations/opentable-live-smoke-era89-policy";
import { QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT } from "@/lib/integrations/quickbooks-live-smoke-era80-policy";
import { RESY_LIVE_SMOKE_ERA90_SUMMARY_ARTIFACT } from "@/lib/integrations/resy-live-smoke-era90-policy";
import { SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT } from "@/lib/integrations/seven-shifts-live-smoke-era82-policy";
import { SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT } from "@/lib/integrations/shopify-live-smoke-era72-policy";
import { SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT } from "@/lib/integrations/skip-live-smoke-era79-policy";
import { SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT } from "@/lib/integrations/square-payments-live-smoke-era87-policy";
import { STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT } from "@/lib/integrations/stripe-live-smoke-era86-policy";
import { UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT } from "@/lib/integrations/uber-eats-live-smoke-era76-policy";
import { WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT } from "@/lib/integrations/woocommerce-live-smoke-era71-policy";
import { XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT } from "@/lib/integrations/xero-live-smoke-era81-policy";

export const LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID =
  "absolute-final-live-integrations-staging-v1" as const;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_ARTIFACT =
  "artifacts/live-integrations-staging-smoke-summary.json" as const;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_NPM_SCRIPT =
  "smoke:live-integrations-staging" as const;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-live-integrations-staging.ts" as const;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_OPS_DOC =
  "docs/live-integrations-staging-smoke-setup.md" as const;

/** 17 LIVE registry providers + Integration Health dashboard probe. */
export const LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT =
  LIVE_INTEGRATION_REGISTRY_LIVE_COUNT + 1;

/** Shared staging env for all merchant-credential live smokes. */
export const LIVE_INTEGRATIONS_STAGING_SHARED_ENV_KEYS = [
  "E2E_STAGING_BASE_URL",
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "CHANNEL_SMOKE_CONNECTION_ID",
  "CHANNEL_SMOKE_OWNER_EMAIL",
] as const;

export type LiveIntegrationsStagingSmokeKind = "merchant_live" | "integration_health_probe";

export type LiveIntegrationsStagingSmokeFleetEntry = {
  integrationId: string;
  name: string;
  kind: LiveIntegrationsStagingSmokeKind;
  smokeScript: string | null;
  summaryArtifact: string | null;
  /** Representative direct merchant env keys (Path A); DB path uses shared keys. */
  merchantEnvKeys: readonly string[];
};

export const LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET: readonly LiveIntegrationsStagingSmokeFleetEntry[] =
  [
    {
      integrationId: "woocommerce",
      name: "WooCommerce",
      kind: "merchant_live",
      smokeScript: "smoke:woo-live",
      summaryArtifact: WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "WOOCOMMERCE_BASE_URL",
        "WOOCOMMERCE_CONSUMER_KEY",
        "WOOCOMMERCE_CONSUMER_SECRET",
        "WOOCOMMERCE_WEBHOOK_SECRET",
      ],
    },
    {
      integrationId: "shopify",
      name: "Shopify",
      kind: "merchant_live",
      smokeScript: "smoke:shopify-live",
      summaryArtifact: SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "SHOPIFY_SHOP_DOMAIN",
        "SHOPIFY_ADMIN_ACCESS_TOKEN",
        "SHOPIFY_APP_SECRET",
      ],
    },
    {
      integrationId: "uber-eats",
      name: "Uber Eats",
      kind: "merchant_live",
      smokeScript: "smoke:uber-eats-live",
      summaryArtifact: UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "UBER_EATS_CLIENT_ID",
        "UBER_EATS_CLIENT_SECRET",
        "UBER_EATS_STORE_ID",
        "UBER_EATS_WEBHOOK_SECRET",
      ],
    },
    {
      integrationId: "doordash",
      name: "DoorDash",
      kind: "merchant_live",
      smokeScript: "smoke:doordash-live",
      summaryArtifact: DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "DOORDASH_API_KEY",
        "DOORDASH_MERCHANT_ID",
        "DOORDASH_WEBHOOK_SECRET",
      ],
    },
    {
      integrationId: "grubhub",
      name: "Grubhub",
      kind: "merchant_live",
      smokeScript: "smoke:grubhub-live",
      summaryArtifact: GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "GRUBHUB_CLIENT_ID",
        "GRUBHUB_CLIENT_SECRET",
        "GRUBHUB_MERCHANT_ID",
        "GRUBHUB_WEBHOOK_SECRET",
      ],
    },
    {
      integrationId: "skip",
      name: "Skip / Just Eat",
      kind: "merchant_live",
      smokeScript: "smoke:skip-live",
      summaryArtifact: SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "SKIP_API_KEY",
        "SKIP_RESTAURANT_ID",
        "SKIP_WEBHOOK_SECRET",
      ],
    },
    {
      integrationId: "quickbooks",
      name: "QuickBooks",
      kind: "merchant_live",
      smokeScript: "smoke:quickbooks-live",
      summaryArtifact: QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "QUICKBOOKS_CLIENT_ID",
        "QUICKBOOKS_CLIENT_SECRET",
        "QUICKBOOKS_REALM_ID",
      ],
    },
    {
      integrationId: "xero",
      name: "Xero",
      kind: "merchant_live",
      smokeScript: "smoke:xero-live",
      summaryArtifact: XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "XERO_CLIENT_ID",
        "XERO_CLIENT_SECRET",
        "XERO_TENANT_ID",
      ],
    },
    {
      integrationId: "7shifts",
      name: "7shifts",
      kind: "merchant_live",
      smokeScript: "smoke:seven-shifts-live",
      summaryArtifact: SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["SEVEN_SHIFTS_API_KEY", "SEVEN_SHIFTS_COMPANY_ID"],
    },
    {
      integrationId: "homebase",
      name: "Homebase",
      kind: "merchant_live",
      smokeScript: "smoke:homebase-live",
      summaryArtifact: HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["HOMEBASE_API_KEY", "HOMEBASE_LOCATION_ID"],
    },
    {
      integrationId: "klaviyo",
      name: "Klaviyo",
      kind: "merchant_live",
      smokeScript: "smoke:klaviyo-live",
      summaryArtifact: KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["KLAVIYO_PRIVATE_API_KEY", "KLAVIYO_LIST_ID"],
    },
    {
      integrationId: "mailchimp",
      name: "Mailchimp",
      kind: "merchant_live",
      smokeScript: "smoke:mailchimp-live",
      summaryArtifact: MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["MAILCHIMP_API_KEY", "MAILCHIMP_SERVER_PREFIX", "MAILCHIMP_LIST_ID"],
    },
    {
      integrationId: "stripe",
      name: "Stripe",
      kind: "merchant_live",
      smokeScript: "smoke:stripe-live",
      summaryArtifact: STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    },
    {
      integrationId: "square-payments",
      name: "Square Payments",
      kind: "merchant_live",
      smokeScript: "smoke:square-payments-live",
      summaryArtifact: SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT,
      merchantEnvKeys: [
        "SQUARE_ACCESS_TOKEN",
        "SQUARE_LOCATION_ID",
        "SQUARE_WEBHOOK_SIGNATURE_KEY",
      ],
    },
    {
      integrationId: "moneris",
      name: "Moneris",
      kind: "merchant_live",
      smokeScript: "smoke:moneris-live",
      summaryArtifact: MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["MONERIS_STORE_ID", "MONERIS_API_TOKEN"],
    },
    {
      integrationId: "opentable",
      name: "OpenTable",
      kind: "merchant_live",
      smokeScript: "smoke:opentable-live",
      summaryArtifact: OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["OPENTABLE_CLIENT_ID", "OPENTABLE_CLIENT_SECRET", "OPENTABLE_RID"],
    },
    {
      integrationId: "resy",
      name: "Resy",
      kind: "merchant_live",
      smokeScript: "smoke:resy-live",
      summaryArtifact: RESY_LIVE_SMOKE_ERA90_SUMMARY_ARTIFACT,
      merchantEnvKeys: ["RESY_API_KEY", "RESY_VENUE_ID"],
    },
    {
      integrationId: "integration-health",
      name: "Integration Health (LIVE dashboard)",
      kind: "integration_health_probe",
      smokeScript: null,
      summaryArtifact: null,
      merchantEnvKeys: [],
    },
  ] as const;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_INTEGRATION_HEALTH_PATH =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_INTEGRATION_HEALTH_PATH;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_CI_SCRIPTS = [
  "test:ci:live-integrations-staging-smoke",
  "test:ci:live-integrations-staging-smoke:cert",
] as const;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_UNIT_TESTS = [
  "tests/unit/live-integrations-staging-smoke.test.ts",
] as const;

export const LIVE_INTEGRATIONS_STAGING_SMOKE_CYCLE_RUNBOOK_STEPS = [
  "Copy `.env.smoke.example` → `.env.smoke.local` and fill staging merchant credentials.",
  "Set E2E_STAGING_BASE_URL, DATABASE_URL, ENCRYPTION_KEY, and CHANNEL_SMOKE_OWNER_EMAIL (or CONNECTION_ID).",
  "Run npm run test:ci:live-integrations-staging-smoke:cert — policy wiring PASSED.",
  "Run npm run smoke:live-integrations-staging — 17 merchant live smokes + Integration Health probe.",
  "Missing per-provider credentials → SKIPPED WITH REASON (exit 0). Real API failure → FAILED (exit 1).",
] as const;
