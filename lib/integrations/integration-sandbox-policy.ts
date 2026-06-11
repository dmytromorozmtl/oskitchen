/**
 * P1-33 — integration sandbox: test credentials for 18 LIVE integrations.
 */

import {
  LIVE_INTEGRATIONS_STAGING_SHARED_ENV_KEYS,
  LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT,
  LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET,
} from "@/lib/integrations/live-integrations-staging-smoke-policy";

export const INTEGRATION_SANDBOX_POLICY_ID = "integration-sandbox-p1-33-v1" as const;

/** Copy to `.env.integration-sandbox.local` (gitignored) for local/staging sandbox runs. */
export const INTEGRATION_SANDBOX_EXAMPLE_FILE = ".env.integration-sandbox.example" as const;

export const INTEGRATION_SANDBOX_LOCAL_FILE = ".env.integration-sandbox.local" as const;

/** Back-compat alias used by live smoke scripts. */
export const INTEGRATION_SANDBOX_LEGACY_SMOKE_FILE = ".env.smoke.local" as const;

export const INTEGRATION_SANDBOX_EXPECTED_COUNT =
  LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT;

export const INTEGRATION_SANDBOX_SHARED_ENV_KEYS = LIVE_INTEGRATIONS_STAGING_SHARED_ENV_KEYS;

export const INTEGRATION_SANDBOX_FLEET = LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET;

export const INTEGRATION_SANDBOX_CHECK_SCRIPT = "scripts/check-integration-sandbox.ts" as const;

export const INTEGRATION_SANDBOX_CI_SCRIPTS = [
  "test:ci:integration-sandbox",
  "check:integration-sandbox",
] as const;

export const INTEGRATION_SANDBOX_RUNBOOK_STEPS = [
  `Copy ${INTEGRATION_SANDBOX_EXAMPLE_FILE} → ${INTEGRATION_SANDBOX_LOCAL_FILE} and fill sandbox credentials.`,
  "Set shared staging env: E2E_STAGING_BASE_URL, DATABASE_URL, ENCRYPTION_KEY, CHANNEL_SMOKE_OWNER_EMAIL.",
  "Add per-provider test keys — at least one merchantEnvKey per LIVE integration you want to prove.",
  "Run npm run check:integration-sandbox — prints configured vs missing for all 18 surfaces.",
  "Run npm run smoke:live-integrations-staging — fleet uses the same credential registry.",
] as const;
