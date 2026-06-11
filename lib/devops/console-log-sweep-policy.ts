/**
 * P1-38 — console.log sweep: structured logger in top-50 CLI files + ESLint guard on runtime.
 */

export const CONSOLE_LOG_SWEEP_POLICY_ID = "console-log-sweep-p1-38-v1" as const;

export const CONSOLE_LOG_SWEEP_BASELINE_TOTAL = 3394 as const;

export const CONSOLE_LOG_SWEEP_TOP_50_COUNT = 50 as const;

export const CONSOLE_LOG_SWEEP_SUMMARY_ARTIFACT =
  "artifacts/console-log-sweep-summary.json" as const;

export const CONSOLE_LOG_SWEEP_AUDIT_SCRIPT = "scripts/audit-console-log-surface.ts" as const;

export const CONSOLE_LOG_SWEEP_NPM_SCRIPT = "audit:console-log-surface" as const;

export const CONSOLE_LOG_SWEEP_UNIT_TEST = "tests/unit/console-log-sweep.test.ts" as const;

export const CONSOLE_LOG_SWEEP_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

/** Tier A — production runtime; must stay at zero console.log/debug/info. */
export const CONSOLE_LOG_SWEEP_RUNTIME_DIRS = [
  "app",
  "components",
  "actions",
  "services",
] as const;

/** Tier A lib allowlist — intentional console sink or legacy CLI formatters. */
export const CONSOLE_LOG_SWEEP_LIB_ALLOWLIST = [
  "lib/logger.ts",
  "lib/integrations/channel-live-smoke-summary.ts",
] as const;

/** Highest-volume script paths migrated to logger.cli (structured + redacted). */
export const CONSOLE_LOG_SWEEP_TOP_50_FILES = [
  "scripts/push-vercel-production-sentry.ts",
  "scripts/beta-program.ts",
  "scripts/run-pilot-upstash-gate.ts",
  "scripts/print-pilot-remaining-work.ts",
  "scripts/staging-upstash-wizard.ts",
  "scripts/smoke-remediation.ts",
  "scripts/staging-edge-experiment-smoke.ts",
  "scripts/staging-ops-status.ts",
  "scripts/ops/run-commercial-gate-execution.ts",
  "scripts/check-env.ts",
  "scripts/beta-preflight.ts",
  "scripts/ops/run-pilot-week1-execution.ts",
  "scripts/diagnose-woo-live-smoke.ts",
  "scripts/smoke-tier2-staging-golden-path-era20.ts",
  "scripts/reset-demo-tenant.ts",
  "scripts/push-vercel-staging-env.ts",
  "scripts/print-live-smoke-checklist.ts",
  "scripts/ops/validate-p0-vault-env.ts",
  "scripts/ops/run-sustained-product-evolution-execution.ts",
  "scripts/ops/run-maintenance-mode-execution.ts",
  "scripts/ops/run-continuous-improvement-loop-execution.ts",
  "scripts/beta-setup.ts",
  "scripts/workspace-migration-dry-run-report.ts",
  "scripts/ops/run-tier2-staging-proof-execution.ts",
  "scripts/ops/run-steady-state-operator-loop-lock-execution.ts",
  "scripts/ops/run-pilot-scale-expansion-execution.ts",
  "scripts/ops/run-commercial-pilot-path-absolute-end-lock-execution.ts",
  "scripts/beta-support-setup.ts",
  "scripts/archive-experimental-crons.ts",
  "scripts/storefront-diagnose-deploy.ts",
  "scripts/staging-remediation-preflight.ts",
  "scripts/run-golden-path-repeat-qa.ts",
  "scripts/ops/validate-tier2-golden-path-env.ts",
  "scripts/ops/validate-era25-steady-state-operator-loop-lock-integrity.ts",
  "scripts/ops/validate-era25-convergence-governance-terminus-freeze-integrity.ts",
  "scripts/ops/validate-era25-commercial-pilot-convergence-train-capstone-integrity.ts",
  "scripts/diagnose-prisma-env.ts",
  "scripts/beta-tune-templates.ts",
  "scripts/beta-day1-complete.ts",
  "scripts/verify-storefront-migration.ts",
  "scripts/smoke-woo-shopify-live-era17.ts",
  "scripts/run-golden-path-prod-qa.ts",
  "scripts/ops/validate-sustained-product-evolution-re-entrant-integrity.ts",
  "scripts/ops/validate-commercial-inflection-readiness.ts",
  "scripts/ops/run-sustained-operational-excellence-execution.ts",
  "scripts/ops/run-series-a-partner-expansion-execution.ts",
  "scripts/ops/run-production-ga-execution.ts",
  "scripts/ops/run-market-leader-positioning-execution.ts",
  "scripts/ops/run-linear-path-permanently-closed-post-absolute-end-orchestrator.ts",
  "scripts/storefront-stripe-connect-smoke.ts",
] as const;

export const CONSOLE_LOG_SWEEP_CI_SCRIPTS = [
  "test:ci:console-log-sweep",
  CONSOLE_LOG_SWEEP_NPM_SCRIPT,
  "audit:console-log",
] as const;
