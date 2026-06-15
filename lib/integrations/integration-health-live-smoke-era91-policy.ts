/**
 * Era 91 — Integration Health LIVE smoke PASS (Phase 1 extension #91).
 *
 * Fleet cert: all 17 LIVE provider smokes + Integration Health dashboard wiring.
 */

import { INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT } from "@/lib/integrations/integration-health-live-policy";

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID =
  "era91-integration-health-live-smoke-v1" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT =
  "artifacts/integration-health-live-smoke-summary.json" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_NPM_SCRIPT =
  "smoke:integration-health-live" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-integration-health-live-era91.ts" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_OPS_DOC =
  "docs/integration-health-live-smoke-setup.md" as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE =
  INTEGRATION_HEALTH_LIVE_EXPECTED_COUNT + 1;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS = [
  {
    integrationId: "woocommerce",
    name: "WooCommerce",
    era: 71,
    certScript: "test:ci:woocommerce-live-smoke-era71:cert",
    policyPath: "lib/integrations/woocommerce-live-smoke-era71-policy.ts",
  },
  {
    integrationId: "shopify",
    name: "Shopify",
    era: 72,
    certScript: "test:ci:shopify-live-smoke-era72:cert",
    policyPath: "lib/integrations/shopify-live-smoke-era72-policy.ts",
  },
  {
    integrationId: "uber-eats",
    name: "Uber Eats",
    era: 76,
    certScript: "test:ci:uber-eats-live-smoke-era76:cert",
    policyPath: "lib/integrations/uber-eats-live-smoke-era76-policy.ts",
  },
  {
    integrationId: "doordash",
    name: "DoorDash",
    era: 77,
    certScript: "test:ci:doordash-live-smoke-era77:cert",
    policyPath: "lib/integrations/doordash-live-smoke-era77-policy.ts",
  },
  {
    integrationId: "grubhub",
    name: "Grubhub",
    era: 78,
    certScript: "test:ci:grubhub-live-smoke-era78:cert",
    policyPath: "lib/integrations/grubhub-live-smoke-era78-policy.ts",
  },
  {
    integrationId: "skip",
    name: "Skip / Just Eat",
    era: 79,
    certScript: "test:ci:skip-live-smoke-era79:cert",
    policyPath: "lib/integrations/skip-live-smoke-era79-policy.ts",
  },
  {
    integrationId: "quickbooks",
    name: "QuickBooks",
    era: 80,
    certScript: "test:ci:quickbooks-live-smoke-era80:cert",
    policyPath: "lib/integrations/quickbooks-live-smoke-era80-policy.ts",
  },
  {
    integrationId: "xero",
    name: "Xero",
    era: 81,
    certScript: "test:ci:xero-live-smoke-era81:cert",
    policyPath: "lib/integrations/xero-live-smoke-era81-policy.ts",
  },
  {
    integrationId: "7shifts",
    name: "7shifts",
    era: 82,
    certScript: "test:ci:seven-shifts-live-smoke-era82:cert",
    policyPath: "lib/integrations/seven-shifts-live-smoke-era82-policy.ts",
  },
  {
    integrationId: "homebase",
    name: "Homebase",
    era: 83,
    certScript: "test:ci:homebase-live-smoke-era83:cert",
    policyPath: "lib/integrations/homebase-live-smoke-era83-policy.ts",
  },
  {
    integrationId: "klaviyo",
    name: "Klaviyo",
    era: 84,
    certScript: "test:ci:klaviyo-live-smoke-era84:cert",
    policyPath: "lib/integrations/klaviyo-live-smoke-era84-policy.ts",
  },
  {
    integrationId: "mailchimp",
    name: "Mailchimp",
    era: 85,
    certScript: "test:ci:mailchimp-live-smoke-era85:cert",
    policyPath: "lib/integrations/mailchimp-live-smoke-era85-policy.ts",
  },
  {
    integrationId: "stripe",
    name: "Stripe",
    era: 86,
    certScript: "test:ci:stripe-live-smoke-era86:cert",
    policyPath: "lib/integrations/stripe-live-smoke-era86-policy.ts",
  },
  {
    integrationId: "square-payments",
    name: "Square Payments",
    era: 87,
    certScript: "test:ci:square-payments-live-smoke-era87:cert",
    policyPath: "lib/integrations/square-payments-live-smoke-era87-policy.ts",
  },
  {
    integrationId: "moneris",
    name: "Moneris",
    era: 88,
    certScript: "test:ci:moneris-live-smoke-era88:cert",
    policyPath: "lib/integrations/moneris-live-smoke-era88-policy.ts",
  },
  {
    integrationId: "opentable",
    name: "OpenTable",
    era: 89,
    certScript: "test:ci:opentable-live-smoke-era89:cert",
    policyPath: "lib/integrations/opentable-live-smoke-era89-policy.ts",
  },
  {
    integrationId: "resy",
    name: "Resy",
    era: 90,
    certScript: "test:ci:resy-live-smoke-era90:cert",
    policyPath: "lib/integrations/resy-live-smoke-era90-policy.ts",
  },
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_DASHBOARD_PATHS = [
  "app/dashboard/integration-health/live/page.tsx",
  "services/integrations/integration-health-live-service.ts",
  "components/integrations/integration-health-live-panel.tsx",
  "lib/integrations/integration-health-live-policy.ts",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_CYCLE_RUNBOOK_STEPS = [
  "Confirm all 17 LIVE provider era71–era90 wiring certs exist in repo.",
  "Open Dashboard → Integration Health → LIVE — verify 17 health scores + trends.",
  "Run npm run smoke:integration-health-live-era91 — fleet cert artifact PASSED.",
  "Activate live tenant credentials per provider when ready — individual smokes may SKIPPED until vault configured.",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_CI_SCRIPTS = [
  "test:ci:integration-health-live-smoke-era91",
  "test:ci:integration-health-live-smoke-era91:cert",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_UNIT_TESTS = [
  "tests/unit/integration-health-live-smoke-era91.test.ts",
  "tests/unit/integration-health-live-service.test.ts",
] as const;

export const INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health/live" as const;
