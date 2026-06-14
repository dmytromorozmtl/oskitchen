import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditSentryAlertFiringP2_36 } from "@/lib/qa/sentry-alert-firing-p2-36-audit";
import {
  SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS,
  SENTRY_ALERT_FIRING_P1_40_ARTIFACT,
  SENTRY_ALERT_FIRING_P1_40_CHAIN,
  SENTRY_ALERT_FIRING_P1_40_POLICY_ID,
  isSentryAlertFiringP140WithinSla,
} from "@/lib/qa/sentry-alert-firing-p1-40-policy";
import {
  SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC,
  SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS,
} from "@/lib/qa/sentry-alert-firing-p2-36-policy";

export type SentryAlertFiringP140AuditSummary = {
  policyId: typeof SENTRY_ALERT_FIRING_P1_40_POLICY_ID;
  chain: readonly string[];
  flowSteps: readonly string[];
  alertSlaMs: number;
  baseAuditPassed: boolean;
  alertRulesDocPresent: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditSentryAlertFiringP140(
  root = process.cwd(),
): SentryAlertFiringP140AuditSummary {
  const base = auditSentryAlertFiringP2_36(root);
  const artifactPresent = existsSync(join(root, SENTRY_ALERT_FIRING_P1_40_ARTIFACT));
  const alertRulesDocPresent = existsSync(join(root, SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC));

  let alertRulesReferenceSla = false;
  if (alertRulesDocPresent) {
    const doc = readFileSync(join(root, SENTRY_ALERT_FIRING_P2_36_ALERT_RULES_DOC), "utf8");
    alertRulesReferenceSla =
      doc.includes("5 minute") || doc.includes("5-minute") || doc.includes("5 min");
  }

  const flowStepsMatch =
    SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS.includes("verify_alert_notification") &&
    SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS.includes("trigger_error");

  const slaHelperOk =
    isSentryAlertFiringP140WithinSla(0) &&
    isSentryAlertFiringP140WithinSla(SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS) &&
    !isSentryAlertFiringP140WithinSla(SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS + 1);

  const passed =
    base.passed &&
    flowStepsMatch &&
    alertRulesDocPresent &&
    alertRulesReferenceSla &&
    slaHelperOk &&
    artifactPresent &&
    SENTRY_ALERT_FIRING_P1_40_CHAIN.length === 3;

  return {
    policyId: SENTRY_ALERT_FIRING_P1_40_POLICY_ID,
    chain: SENTRY_ALERT_FIRING_P1_40_CHAIN,
    flowSteps: SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS,
    alertSlaMs: SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS,
    baseAuditPassed: base.passed,
    alertRulesDocPresent,
    artifactPresent,
    passed,
  };
}

export function formatSentryAlertFiringP140AuditLines(
  summary: SentryAlertFiringP140AuditSummary,
): string[] {
  return [
    `Sentry alert firing (P1-40) audit (${summary.policyId})`,
    `Chain: ${summary.chain.join(" → ")}`,
    `Flow steps: ${summary.flowSteps.join(" → ")}`,
    `Alert SLA: ${summary.alertSlaMs / 1000 / 60} minutes`,
    `Base audit: ${summary.baseAuditPassed ? "passed" : "failed"}`,
    `Alert rules doc: ${summary.alertRulesDocPresent ? "present" : "missing"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

export function readSentryAlertFiringP140Artifact(root = process.cwd()): {
  policyId: string;
  chain: string[];
  alertSlaMs: number;
} | null {
  const path = join(root, SENTRY_ALERT_FIRING_P1_40_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    policyId: string;
    chain: string[];
    alertSlaMs: number;
  };
}
