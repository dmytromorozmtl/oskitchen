/**
 * Era 143 — Sentry production wiring cert (Phase 10 #70).
 *
 * Full path: Sentry.init() SDK wiring → SENTRY_DSN on Vercel → health probe.
 */

import {
  SENTRY_PRODUCTION_ERA70_ACTIVATION_SCRIPT,
  SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH,
  SENTRY_PRODUCTION_ERA70_OPS_DOC,
  SENTRY_PRODUCTION_ERA70_POLICY_ID,
  SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS,
  SENTRY_PRODUCTION_ERA70_WIRING_PATHS,
} from "@/lib/observability/sentry-production-era70-policy";

export const SENTRY_PRODUCTION_ERA143_POLICY_ID = "era143-sentry-production-v1" as const;

export const SENTRY_PRODUCTION_ERA143_SUMMARY_ARTIFACT =
  "artifacts/sentry-production-era143-smoke-summary.json" as const;

export const SENTRY_PRODUCTION_ERA143_NPM_SCRIPT = "smoke:sentry-production-era143" as const;

export const SENTRY_PRODUCTION_ERA143_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-sentry-production-era143.ts" as const;

export const SENTRY_PRODUCTION_ERA143_OPS_DOC = "docs/sentry-production-era143-setup.md" as const;

export const SENTRY_PRODUCTION_ERA143_ACTIVATION_SCRIPT = SENTRY_PRODUCTION_ERA70_ACTIVATION_SCRIPT;

export const SENTRY_PRODUCTION_ERA143_CANONICAL_OPS_DOC = SENTRY_PRODUCTION_ERA70_OPS_DOC;

export const SENTRY_PRODUCTION_ERA143_WIRING_PATHS = SENTRY_PRODUCTION_ERA70_WIRING_PATHS;

export const SENTRY_PRODUCTION_ERA143_CYCLE_RUNBOOK_STEPS = [
  "Create Sentry Next.js project and copy DSN (never commit).",
  "Set SENTRY_DSN in Vercel Production — npm run sentry:production:activate -- --apply.",
  "Confirm Sentry.init() in sentry.server.config.ts and instrumentation-client.ts.",
  "Verify GET /api/health → checks.sentryServer.ok after redeploy.",
  "Run npm run smoke:sentry-production-era143 — artifact overall PASSED.",
] as const;

export const SENTRY_PRODUCTION_ERA143_CI_SCRIPTS = [
  "test:ci:sentry-production-era143",
  "test:ci:sentry-production-era143:cert",
] as const;

export const SENTRY_PRODUCTION_ERA143_UNIT_TESTS = [
  "tests/unit/sentry-production-era143.test.ts",
  "tests/unit/sentry-production-era70.test.ts",
  "tests/unit/sentry-integration.test.ts",
] as const;

export const SENTRY_PRODUCTION_ERA143_CANONICAL_POLICY_ID = SENTRY_PRODUCTION_ERA70_POLICY_ID;

export const SENTRY_PRODUCTION_ERA143_DEVELOPER_PATH = SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH;

export const SENTRY_PRODUCTION_ERA143_REQUIRED_ENV_VARS = SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS;

export const SENTRY_PRODUCTION_ERA143_CAPABILITIES = [
  "sdk_init",
  "error_capture",
  "health_probe",
] as const;
