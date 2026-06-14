import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSentryAlertFiringP140,
  formatSentryAlertFiringP140AuditLines,
  readSentryAlertFiringP140Artifact,
} from "@/lib/qa/sentry-alert-firing-p1-40-audit";
import {
  SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS,
  SENTRY_ALERT_FIRING_P1_40_ARTIFACT,
  SENTRY_ALERT_FIRING_P1_40_CHAIN,
  SENTRY_ALERT_FIRING_P1_40_CHECK_NPM_SCRIPT,
  SENTRY_ALERT_FIRING_P1_40_CI_NPM_SCRIPT,
  SENTRY_ALERT_FIRING_P1_40_CI_WORKFLOW,
  SENTRY_ALERT_FIRING_P1_40_DOC,
  SENTRY_ALERT_FIRING_P1_40_POLICY_ID,
  SENTRY_ALERT_FIRING_P1_40_RUN_NPM_SCRIPT,
  SENTRY_ALERT_FIRING_P1_40_WIRING_PATHS,
  buildSentryAlertFiringP2_36TriggerUrl,
  isSentryAlertFiringP140WithinSla,
} from "@/lib/qa/sentry-alert-firing-p1-40-policy";
import {
  SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS,
  SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL,
  SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE,
} from "@/lib/qa/sentry-alert-firing-p2-36-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Sentry alert firing — production verification (P1-40)", () => {
  it("locks P1-40 policy and error→Sentry→alert chain with 5 min SLA", () => {
    expect(SENTRY_ALERT_FIRING_P1_40_POLICY_ID).toBe("sentry-alert-firing-p1-40-v1");
    expect(SENTRY_ALERT_FIRING_P1_40_CHAIN).toEqual([
      "error",
      "sentry_capture",
      "alert_notification",
    ]);
    expect(SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS).toBe(5 * 60 * 1000);
    expect(SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS).toEqual([
      "trigger_error",
      "verify_sentry_capture",
      "verify_alert_notification",
      "verify_production_health",
    ]);
    expect(SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL).toBe("cron_failure");
  });

  it("builds trigger URL and enforces 5-minute alert SLA", () => {
    expect(buildSentryAlertFiringP2_36TriggerUrl("https://app.example.com")).toBe(
      `https://app.example.com${SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE}?fail=1`,
    );
    expect(isSentryAlertFiringP140WithinSla(60_000)).toBe(true);
    expect(isSentryAlertFiringP140WithinSla(SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS)).toBe(true);
    expect(isSentryAlertFiringP140WithinSla(SENTRY_ALERT_FIRING_P1_40_ALERT_SLA_MS + 1)).toBe(
      false,
    );
  });

  it("passes full P1-40 audit — trigger route, ops signals, alert rules, artifact", () => {
    const summary = auditSentryAlertFiringP140(ROOT);
    expect(summary.baseAuditPassed).toBe(true);
    expect(summary.alertRulesDocPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("health-ping route wires fail=1 to cron_failure Sentry capture", () => {
    const route = readSource("app/api/cron/health-ping/route.ts");
    expect(route).toContain("fail");
    expect(route).toContain("emitCronFailure");
  });

  it("P1-40 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SENTRY_ALERT_FIRING_P1_40_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${SENTRY_ALERT_FIRING_P1_40_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SENTRY_ALERT_FIRING_P1_40_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SENTRY_ALERT_FIRING_P1_40_RUN_NPM_SCRIPT}"`);

    const ci = readSource(SENTRY_ALERT_FIRING_P1_40_CI_WORKFLOW);
    expect(ci).toContain(SENTRY_ALERT_FIRING_P1_40_CHECK_NPM_SCRIPT);

    const doc = readSource(SENTRY_ALERT_FIRING_P1_40_DOC);
    expect(doc).toContain(SENTRY_ALERT_FIRING_P1_40_POLICY_ID);

    const artifact = readSentryAlertFiringP140Artifact(ROOT);
    expect(artifact?.policyId).toBe(SENTRY_ALERT_FIRING_P1_40_POLICY_ID);
    expect(artifact?.chain).toEqual([...SENTRY_ALERT_FIRING_P1_40_CHAIN]);
    expect(artifact?.alertSlaMs).toBe(300_000);

    expect(existsSync(join(ROOT, SENTRY_ALERT_FIRING_P1_40_ARTIFACT))).toBe(true);
  });

  it("formats audit lines", () => {
    const summary = auditSentryAlertFiringP140(ROOT);
    const lines = formatSentryAlertFiringP140AuditLines(summary);
    expect(lines.some((line) => line.includes(SENTRY_ALERT_FIRING_P1_40_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
