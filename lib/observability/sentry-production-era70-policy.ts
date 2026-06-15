/**
 * Era 70 — Sentry production activation (P0 critical path #70).
 *
 * SDK wiring lives in instrumentation + sentry.*.config.ts.
 * Production activation requires SENTRY_DSN on Vercel Production.
 */

export const SENTRY_PRODUCTION_ERA70_POLICY_ID = "era70-sentry-production-v1" as const;

export const SENTRY_PRODUCTION_ERA70_SUMMARY_ARTIFACT =
  "artifacts/sentry-production-smoke-summary.json" as const;

export const SENTRY_PRODUCTION_ERA70_NPM_SCRIPT = "smoke:sentry-production" as const;

export const SENTRY_PRODUCTION_ERA70_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-sentry-production-era70.ts" as const;

export const SENTRY_PRODUCTION_ERA70_ACTIVATION_SCRIPT =
  "scripts/push-vercel-production-sentry.ts" as const;

export const SENTRY_PRODUCTION_ERA70_OPS_DOC = "docs/sentry-production-setup.md" as const;

export const SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS = [
  "SENTRY_DSN",
] as const;

export const SENTRY_PRODUCTION_ERA70_RECOMMENDED_ENV_VARS = [
  "SENTRY_TRACES_SAMPLE_RATE",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
] as const;

export const SENTRY_PRODUCTION_ERA70_WIRING_PATHS = [
  "instrumentation.ts",
  "instrumentation-client.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
  "services/observability/error-reporting-service.ts",
  "app/api/health/route.ts",
  "scripts/push-vercel-production-sentry.ts",
] as const;

export const SENTRY_PRODUCTION_ERA70_CYCLE_RUNBOOK_STEPS = [
  "Create Sentry Next.js project and copy DSN (never commit).",
  "Set SENTRY_DSN (+ optional NEXT_PUBLIC_SENTRY_DSN) in Vercel Production.",
  "Run npm run sentry:production:activate -- --apply --deploy --mirror-public-dsn.",
  "Run npm run smoke:sentry-production — artifact overall PASSED.",
  "Verify GET /api/health → checks.sentryServer.ok: true after redeploy.",
] as const;

export const SENTRY_PRODUCTION_ERA70_CI_SCRIPTS = [
  "test:ci:sentry-production-era70",
  "test:ci:sentry-production-era70:cert",
] as const;

export const SENTRY_PRODUCTION_ERA70_UNIT_TESTS = [
  "tests/unit/sentry-production-era70.test.ts",
  "tests/unit/sentry-integration.test.ts",
] as const;

export const SENTRY_PRODUCTION_ERA70_DEVELOPER_PATH =
  "/dashboard/developer/sentry" as const;
