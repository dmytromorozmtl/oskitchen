import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC,
  SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS,
  SENTRY_ALERT_FIRING_P2_36_AUDIT_SCRIPT,
  SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS,
  SENTRY_ALERT_FIRING_P2_36_NPM_SCRIPT,
  SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL,
  SENTRY_ALERT_FIRING_P2_36_POLICY_ID,
  SENTRY_ALERT_FIRING_P2_36_RUN_SCRIPT,
  SENTRY_ALERT_FIRING_P2_36_RUNBOOK_DOC,
  SENTRY_ALERT_FIRING_P2_36_TRIGGER_QUERY,
  SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE,
  SENTRY_ALERT_FIRING_P2_36_UNIT_TEST,
  SENTRY_ALERT_FIRING_P2_36_VERIFY_SCRIPT,
  isWithinSentryAlertFiringP2_36Sla,
} from "@/lib/qa/sentry-alert-firing-p2-36-policy";

export type SentryAlertFiringP2_36AuditSummary = {
  policyId: typeof SENTRY_ALERT_FIRING_P2_36_POLICY_ID;
  triggerRoutePresent: boolean;
  triggerFailWired: boolean;
  opsSignalsWired: boolean;
  alertRulesDocPresent: boolean;
  alertRulesDocReferencesTrigger: boolean;
  runbookPresent: boolean;
  verifyScriptPresent: boolean;
  runScriptPresent: boolean;
  alertSlaMs: number;
  slaHelperOk: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditSentryAlertFiringP2_36(
  root = process.cwd(),
): SentryAlertFiringP2_36AuditSummary {
  const triggerRoutePath = join(root, "app/api/cron/health-ping/route.ts");
  const opsSignalsPath = join(root, "services/observability/ops-signals.ts");
  const alertRulesPath = join(root, SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC);
  const runbookPath = join(root, SENTRY_ALERT_FIRING_P2_36_RUNBOOK_DOC);
  const verifyScriptPath = join(root, SENTRY_ALERT_FIRING_P2_36_VERIFY_SCRIPT);
  const runScriptPath = join(root, SENTRY_ALERT_FIRING_P2_36_RUN_SCRIPT);
  const unitTestPath = join(root, SENTRY_ALERT_FIRING_P2_36_UNIT_TEST);

  const triggerRoutePresent = existsSync(triggerRoutePath);
  let triggerFailWired = false;
  if (triggerRoutePresent) {
    const source = readFileSync(triggerRoutePath, "utf8");
    triggerFailWired =
      source.includes(SENTRY_ALERT_FIRING_P2_36_TRIGGER_QUERY.split("=")[0]) &&
      source.includes("emitCronFailure") &&
      source.includes("runCronRoute");
  }

  let opsSignalsWired = false;
  if (existsSync(opsSignalsPath)) {
    const source = readFileSync(opsSignalsPath, "utf8");
    opsSignalsWired =
      source.includes(`"${SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL}"`) &&
      source.includes("emitCronFailure") &&
      source.includes('scope.setTag("ops_signal", kind)');
  }

  const alertRulesDocPresent = existsSync(alertRulesPath);
  let alertRulesDocReferencesTrigger = false;
  if (alertRulesDocPresent) {
    const source = readFileSync(alertRulesPath, "utf8");
    alertRulesDocReferencesTrigger =
      source.includes("health-ping") &&
      source.includes(SENTRY_ALERT_FIRING_P2_36_TRIGGER_QUERY) &&
      source.includes(SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL);
  }

  const runbookPresent = existsSync(runbookPath);
  const verifyScriptPresent = existsSync(verifyScriptPath);
  const runScriptPresent = existsSync(runScriptPath);

  const unitTestReferencesPolicy =
    existsSync(unitTestPath) &&
    readFileSync(unitTestPath, "utf8").includes(SENTRY_ALERT_FIRING_P2_36_POLICY_ID);

  const slaHelperOk =
    isWithinSentryAlertFiringP2_36Sla(0) &&
    isWithinSentryAlertFiringP2_36Sla(SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS) &&
    !isWithinSentryAlertFiringP2_36Sla(SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS + 1);

  const passed =
    triggerRoutePresent &&
    triggerFailWired &&
    opsSignalsWired &&
    alertRulesDocPresent &&
    alertRulesDocReferencesTrigger &&
    runbookPresent &&
    verifyScriptPresent &&
    runScriptPresent &&
    unitTestReferencesPolicy &&
    slaHelperOk &&
    SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS.length === 4;

  return {
    policyId: SENTRY_ALERT_FIRING_P2_36_POLICY_ID,
    triggerRoutePresent,
    triggerFailWired,
    opsSignalsWired,
    alertRulesDocPresent,
    alertRulesDocReferencesTrigger,
    runbookPresent,
    verifyScriptPresent,
    runScriptPresent,
    alertSlaMs: SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS,
    slaHelperOk,
    flowStepCount: SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS.length,
    passed,
  };
}

export function formatSentryAlertFiringP2_36AuditLines(
  summary: SentryAlertFiringP2_36AuditSummary,
): string[] {
  return [
    `Sentry alert firing audit (${summary.policyId})`,
    `Trigger route (${SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE}): ${summary.triggerRoutePresent ? "present" : "missing"}`,
    `Fail trigger wired (${SENTRY_ALERT_FIRING_P2_36_TRIGGER_QUERY}): ${summary.triggerFailWired ? "yes" : "no"}`,
    `Ops signals (${SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL}): ${summary.opsSignalsWired ? "wired" : "missing"}`,
    `Alert rules doc: ${summary.alertRulesDocPresent ? "present" : "missing"} (${SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC})`,
    `Alert rules reference trigger: ${summary.alertRulesDocReferencesTrigger ? "yes" : "no"}`,
    `Runbook: ${summary.runbookPresent ? "present" : "missing"} (${SENTRY_ALERT_FIRING_P2_36_RUNBOOK_DOC})`,
    `Verify script: ${summary.verifyScriptPresent ? "present" : "missing"} (${SENTRY_ALERT_FIRING_P2_36_VERIFY_SCRIPT})`,
    `Run script: ${summary.runScriptPresent ? "present" : "missing"} (${SENTRY_ALERT_FIRING_P2_36_RUN_SCRIPT})`,
    `Alert SLA: ${summary.alertSlaMs / 1000 / 60} minutes`,
    `SLA helper: ${summary.slaHelperOk ? "ok" : "broken"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${SENTRY_ALERT_FIRING_P2_36_UNIT_TEST}`,
    `Audit script: ${SENTRY_ALERT_FIRING_P2_36_AUDIT_SCRIPT}`,
    `NPM script: ${SENTRY_ALERT_FIRING_P2_36_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
