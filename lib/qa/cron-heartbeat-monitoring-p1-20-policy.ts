/**
 * P1-20 — Production cron heartbeat monitoring (`checks.cronExecution.ok` in /api/health).
 *
 * @see docs/cron-heartbeat-monitoring-p1-20.md
 */

import { CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS } from "@/services/cron/production-manifest";

export const CRON_HEARTBEAT_MONITORING_P1_20_POLICY_ID =
  "p1-20-cron-heartbeat-monitoring-v1" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_DOC =
  "docs/cron-heartbeat-monitoring-p1-20.md" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_ARTIFACT =
  "artifacts/cron-heartbeat-monitoring-p1-20.json" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_ROUTE =
  "app/api/health/route.ts" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_SERVICE =
  "services/observability/health-check-service.ts" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_EVIDENCE_SERVICE =
  "services/cron/cron-execution-evidence.ts" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_CONTRACT =
  "lib/api/health-contract.ts" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_SUMMARIZE_FN =
  "summarizeCriticalCronExecutionEvidence" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_LOAD_FN =
  "loadCriticalCronExecutionHealth" as const;

/** Slugs called out in production health degradation reports. */
export const CRON_HEARTBEAT_MONITORING_P1_20_REPORTED_STALE_SLUGS = [
  "webhook-jobs",
  "storefront-edge-sync",
  "doordash-sync",
  "grubhub-sync",
  "kds-overdue-alerts",
] as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_CRITICAL_SLUGS =
  CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS;

export const CRON_HEARTBEAT_MONITORING_P1_20_CHECK_NPM_SCRIPT =
  "check:cron-heartbeat-monitoring-p1-20" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_CI_NPM_SCRIPT =
  "test:ci:cron-heartbeat-monitoring-p1-20" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_UNIT_TEST =
  "tests/unit/cron-heartbeat-monitoring-p1-20.test.ts" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_LEGACY_TEST =
  "tests/unit/cron-execution-evidence.test.ts" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_CONTRACT_TEST =
  "tests/unit/api-health-contract.test.ts" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const CRON_HEARTBEAT_MONITORING_P1_20_WIRING_PATHS = [
  CRON_HEARTBEAT_MONITORING_P1_20_DOC,
  CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_ROUTE,
  CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_SERVICE,
  CRON_HEARTBEAT_MONITORING_P1_20_EVIDENCE_SERVICE,
  CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_CONTRACT,
  CRON_HEARTBEAT_MONITORING_P1_20_UNIT_TEST,
  CRON_HEARTBEAT_MONITORING_P1_20_LEGACY_TEST,
  CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_CONTRACT_TEST,
  CRON_HEARTBEAT_MONITORING_P1_20_ARTIFACT,
  CRON_HEARTBEAT_MONITORING_P1_20_CI_WORKFLOW,
  "services/cron/production-manifest.ts",
] as const;
