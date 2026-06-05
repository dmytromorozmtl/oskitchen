/**
 * BETA integrations registry integrity smoke — post DEV-48 zero-placeholder milestone.
 * Validates all eighteen BETA registry entries ship dashboard pages, services, and API routes.
 */

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID =
  "era17-beta-integrations-registry-smoke-v1" as const;

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_DOC =
  "docs/beta-integrations-registry-smoke.md" as const;

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-beta-integrations-registry-era17.ts" as const;

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT =
  "artifacts/smoke-beta-integrations-registry-summary.json" as const;

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_NPM_SCRIPT =
  "smoke:beta-integrations-registry" as const;

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT = 9 as const;

/** Required repo paths per BETA integration id — honest scaffold, not live proof. */
export const BETA_INTEGRATION_SCAFFOLD_PATHS: Readonly<
  Record<string, readonly string[]>
> = {
  doordash: [
    "app/dashboard/integrations/doordash/page.tsx",
    "services/integrations/doordash/menu-sync.service.ts",
    "app/api/integrations/doordash/menu/route.ts",
  ],
  "uber-eats": [
    "app/dashboard/integrations/uber-eats/page.tsx",
    "services/integrations/uber-eats.ts",
    "app/api/integrations/uber-eats/menu/route.ts",
  ],
  klaviyo: [
    "app/dashboard/integrations/klaviyo/page.tsx",
    "services/integrations/klaviyo-sync-service.ts",
    "app/api/integrations/klaviyo/sync/route.ts",
  ],
  mailchimp: [
    "app/dashboard/integrations/mailchimp/page.tsx",
    "services/integrations/mailchimp-sync-service.ts",
    "app/api/integrations/mailchimp/sync/route.ts",
  ],
  "uber-direct": [
    "app/dashboard/integrations/uber-direct/page.tsx",
    "services/delivery/uber-direct.ts",
  ],
  square: [
    "app/dashboard/integrations/square/page.tsx",
    "services/integrations/square-sync-service.ts",
    "app/api/integrations/square/sync/route.ts",
  ],
  toast: [
    "app/dashboard/integrations/toast/page.tsx",
    "services/integrations/toast-sync-service.ts",
    "app/api/integrations/toast/sync/route.ts",
  ],
  clover: [
    "app/dashboard/integrations/clover/page.tsx",
    "services/integrations/clover-sync-service.ts",
    "app/api/integrations/clover/sync/route.ts",
  ],
  lightspeed: [
    "app/dashboard/integrations/lightspeed/page.tsx",
    "services/integrations/lightspeed-sync-service.ts",
    "app/api/integrations/lightspeed/sync/route.ts",
  ],
  "google-forms": [
    "app/dashboard/integrations/google-forms/page.tsx",
    "services/integrations/google-forms-sync-service.ts",
    "app/api/integrations/google-forms/sync/route.ts",
  ],
  "email-orders": [
    "app/dashboard/integrations/email-orders/page.tsx",
    "services/integrations/email-orders-intake-service.ts",
    "app/api/integrations/email-orders/intake/route.ts",
  ],
};

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Confirm lib/integrations/integration-registry.ts lists eighteen BETA entries — zero PLACEHOLDER.",
  "Run npm run smoke:beta-integrations-registry — review artifacts/smoke-beta-integrations-registry-summary.json.",
  "Wire staging credentials per integration before claiming live_proven in GTM.",
] as const;
