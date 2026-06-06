/**
 * Era 141 — SLA Monitoring wiring cert (Phase 9 #68).
 *
 * Full path: uptime → response time → predictive alerts.
 */

import {
  SLA_MONITORING_PATH,
  SLA_MONITORING_POLICY_ID,
  SLA_MONITORING_SIGNALS,
} from "@/lib/enterprise/sla-monitoring-policy";

export const SLA_MONITORING_ERA141_POLICY_ID = "era141-sla-monitoring-v1" as const;

export const SLA_MONITORING_ERA141_SUMMARY_ARTIFACT =
  "artifacts/sla-monitoring-smoke-summary.json" as const;

export const SLA_MONITORING_ERA141_NPM_SCRIPT = "smoke:sla-monitoring-era141" as const;

export const SLA_MONITORING_ERA141_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-sla-monitoring-era141.ts" as const;

export const SLA_MONITORING_ERA141_OPS_DOC = "docs/sla-monitoring-era141-setup.md" as const;

export const SLA_MONITORING_ERA141_SERVICE = "services/enterprise/sla-service.ts" as const;

export const SLA_MONITORING_ERA141_WIRING_PATHS = [
  SLA_MONITORING_ERA141_SERVICE,
  "lib/enterprise/sla-monitoring-builders.ts",
  "lib/enterprise/sla-monitoring-policy.ts",
  "app/dashboard/enterprise/sla/page.tsx",
  "components/enterprise/sla-monitoring-panel.tsx",
] as const;

export const SLA_MONITORING_ERA141_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → SLA Monitoring.",
  "Review KPI cards — uptime, DB latency, fleet score, alert count.",
  "Inspect SLA signals — platform health, integration fleet, cron, webhooks.",
  "Check Active alerts card for latency, critical integrations, and webhook failures.",
  "Run npm run smoke:sla-monitoring-era141 — artifact overall PASSED.",
] as const;

export const SLA_MONITORING_ERA141_CI_SCRIPTS = [
  "test:ci:sla-monitoring-era141",
  "test:ci:sla-monitoring-era141:cert",
] as const;

export const SLA_MONITORING_ERA141_UNIT_TESTS = [
  "tests/unit/sla-monitoring-era141.test.ts",
  "tests/unit/sla-monitoring.test.ts",
] as const;

export const SLA_MONITORING_ERA141_CANONICAL_POLICY_ID = SLA_MONITORING_POLICY_ID;

export const SLA_MONITORING_ERA141_ROUTE = SLA_MONITORING_PATH;

export const SLA_MONITORING_ERA141_SIGNALS = SLA_MONITORING_SIGNALS;

export const SLA_MONITORING_ERA141_CAPABILITIES = [
  "uptime",
  "response_time",
  "alerts",
] as const;
