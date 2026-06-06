/**
 * Era 166 — Integration Health LIVE dashboard wiring cert (Phase 1 Round 2 #18).
 *
 * Fleet cert: all 17 LIVE provider Round 2 smokes (era149–era165) + Integration Health dashboard.
 */

import {
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_DASHBOARD_PATHS,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_INTEGRATION_HEALTH_PATH,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_OPS_DOC,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT,
} from "@/lib/integrations/integration-health-live-smoke-era91-policy";
import { INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT } from "@/lib/integrations/integration-health-live-policy";

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_POLICY_ID =
  "era166-integration-health-live-v1" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_SUMMARY_ARTIFACT =
  "artifacts/integration-health-live-smoke-era166-smoke-summary.json" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_NPM_SCRIPT =
  "smoke:integration-health-live-era166" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-integration-health-live-era166.ts" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_OPS_DOC =
  "docs/integration-health-live-smoke-era166-setup.md" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CANONICAL_OPS_DOC =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_OPS_DOC;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CANONICAL_SUMMARY_ARTIFACT =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_DASHBOARD_PATHS =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_DASHBOARD_PATHS;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_FLEET_SIZE =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_CERTS = [
  {
    integrationId: "woocommerce",
    name: "WooCommerce",
    era: 154,
    certScript: "test:ci:woocommerce-live-smoke-era154:cert",
    policyPath: "lib/integrations/woocommerce-live-smoke-era154-policy.ts",
  },
  {
    integrationId: "shopify",
    name: "Shopify",
    era: 153,
    certScript: "test:ci:shopify-live-smoke-era153:cert",
    policyPath: "lib/integrations/shopify-live-smoke-era153-policy.ts",
  },
  {
    integrationId: "uber-eats",
    name: "Uber Eats",
    era: 149,
    certScript: "test:ci:uber-eats-live-smoke-era149:cert",
    policyPath: "lib/integrations/uber-eats-live-smoke-era149-policy.ts",
  },
  {
    integrationId: "doordash",
    name: "DoorDash",
    era: 150,
    certScript: "test:ci:doordash-live-smoke-era150:cert",
    policyPath: "lib/integrations/doordash-live-smoke-era150-policy.ts",
  },
  {
    integrationId: "grubhub",
    name: "Grubhub",
    era: 152,
    certScript: "test:ci:grubhub-live-smoke-era152:cert",
    policyPath: "lib/integrations/grubhub-live-smoke-era152-policy.ts",
  },
  {
    integrationId: "skip",
    name: "Skip / Just Eat",
    era: 151,
    certScript: "test:ci:skip-live-smoke-era151:cert",
    policyPath: "lib/integrations/skip-live-smoke-era151-policy.ts",
  },
  {
    integrationId: "quickbooks",
    name: "QuickBooks",
    era: 155,
    certScript: "test:ci:quickbooks-live-smoke-era155:cert",
    policyPath: "lib/integrations/quickbooks-live-smoke-era155-policy.ts",
  },
  {
    integrationId: "xero",
    name: "Xero",
    era: 156,
    certScript: "test:ci:xero-live-smoke-era156:cert",
    policyPath: "lib/integrations/xero-live-smoke-era156-policy.ts",
  },
  {
    integrationId: "7shifts",
    name: "7shifts",
    era: 159,
    certScript: "test:ci:seven-shifts-live-smoke-era159:cert",
    policyPath: "lib/integrations/seven-shifts-live-smoke-era159-policy.ts",
  },
  {
    integrationId: "homebase",
    name: "Homebase",
    era: 160,
    certScript: "test:ci:homebase-live-smoke-era160:cert",
    policyPath: "lib/integrations/homebase-live-smoke-era160-policy.ts",
  },
  {
    integrationId: "klaviyo",
    name: "Klaviyo",
    era: 161,
    certScript: "test:ci:klaviyo-live-smoke-era161:cert",
    policyPath: "lib/integrations/klaviyo-live-smoke-era161-policy.ts",
  },
  {
    integrationId: "mailchimp",
    name: "Mailchimp",
    era: 162,
    certScript: "test:ci:mailchimp-live-smoke-era162:cert",
    policyPath: "lib/integrations/mailchimp-live-smoke-era162-policy.ts",
  },
  {
    integrationId: "stripe",
    name: "Stripe",
    era: 163,
    certScript: "test:ci:stripe-live-smoke-era163:cert",
    policyPath: "lib/integrations/stripe-live-smoke-era163-policy.ts",
  },
  {
    integrationId: "square-payments",
    name: "Square Payments",
    era: 164,
    certScript: "test:ci:square-payments-live-smoke-era164:cert",
    policyPath: "lib/integrations/square-payments-live-smoke-era164-policy.ts",
  },
  {
    integrationId: "moneris",
    name: "Moneris",
    era: 165,
    certScript: "test:ci:moneris-live-smoke-era165:cert",
    policyPath: "lib/integrations/moneris-live-smoke-era165-policy.ts",
  },
  {
    integrationId: "opentable",
    name: "OpenTable",
    era: 157,
    certScript: "test:ci:opentable-live-smoke-era157:cert",
    policyPath: "lib/integrations/opentable-live-smoke-era157-policy.ts",
  },
  {
    integrationId: "resy",
    name: "Resy",
    era: 158,
    certScript: "test:ci:resy-live-smoke-era158:cert",
    policyPath: "lib/integrations/resy-live-smoke-era158-policy.ts",
  },
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CYCLE_RUNBOOK_STEPS = [
  "Confirm all 17 LIVE provider Round 2 wiring certs (era149–era165) exist in repo.",
  "Open Dashboard → Integration Health → LIVE — verify health scores, 7-day trends, and alerts.",
  "Run npm run smoke:integration-health-live-era166 — Round 2 fleet cert artifact PASSED.",
  "Activate live tenant credentials per provider when ready — individual smokes may SKIPPED until vault configured.",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CI_SCRIPTS = [
  "test:ci:integration-health-live-smoke-era166",
  "test:ci:integration-health-live-smoke-era166:cert",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_UNIT_TESTS = [
  "tests/unit/integration-health-live-smoke-era166.test.ts",
  "tests/unit/integration-health-live-smoke-era91.test.ts",
  "tests/unit/integration-health-live-service.test.ts",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CANONICAL_POLICY_ID =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_INTEGRATION_HEALTH_PATH =
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_INTEGRATION_HEALTH_PATH;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CAPABILITIES = [
  "health_scores",
  "trends",
  "alerts",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_COUNT =
  INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT;
