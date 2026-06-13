import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSentryAlertFiringP2_36,
  formatSentryAlertFiringP2_36AuditLines,
} from "@/lib/qa/sentry-alert-firing-p2-36-audit";
import {
  SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS,
  SENTRY_ALERT_FIRING_P2_36_AUDIT_SCRIPT,
  SENTRY_ALERT_FIRING_P2_36_CI_WORKFLOW,
  SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS,
  SENTRY_ALERT_FIRING_P2_36_NPM_SCRIPT,
  SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL,
  SENTRY_ALERT_FIRING_P2_36_POLICY_ID,
  SENTRY_ALERT_FIRING_P2_36_RUN_SCRIPT,
  SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE,
  SENTRY_ALERT_FIRING_P2_36_UNIT_TEST,
  buildSentryAlertFiringP2_36TriggerUrl,
  isWithinSentryAlertFiringP2_36Sla,
} from "@/lib/qa/sentry-alert-firing-p2-36-policy";

const ROOT = process.cwd();

describe("Sentry alert firing (P2-36)", () => {
  it("locks policy id, ops signal, and four-step flow", () => {
    expect(SENTRY_ALERT_FIRING_P2_36_POLICY_ID).toBe("sentry-alert-firing-p2-36-v1");
    expect(SENTRY_ALERT_FIRING_P2_36_OPS_SIGNAL).toBe("cron_failure");
    expect(SENTRY_ALERT_FIRING_P2_36_FLOW_STEPS).toHaveLength(4);
    expect(SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS).toBe(5 * 60 * 1000);
  });

  it("builds trigger URL and enforces 5-minute SLA helper", () => {
    expect(buildSentryAlertFiringP2_36TriggerUrl("https://staging.example.com")).toBe(
      `https://staging.example.com${SENTRY_ALERT_FIRING_P2_36_TRIGGER_ROUTE}?fail=1`,
    );
    expect(isWithinSentryAlertFiringP2_36Sla(60_000)).toBe(true);
    expect(isWithinSentryAlertFiringP2_36Sla(SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS)).toBe(true);
    expect(isWithinSentryAlertFiringP2_36Sla(SENTRY_ALERT_FIRING_P2_36_ALERT_SLA_MS + 1)).toBe(
      false,
    );
  });

  it("audits trigger route, ops signals, alert rules, and runbook", () => {
    const summary = auditSentryAlertFiringP2_36(ROOT);
    expect(summary.triggerRoutePresent).toBe(true);
    expect(summary.triggerFailWired).toBe(true);
    expect(summary.opsSignalsWired).toBe(true);
    expect(summary.alertRulesDocPresent).toBe(true);
    expect(summary.alertRulesDocReferencesTrigger).toBe(true);
    expect(summary.runbookPresent).toBe(true);
    expect(summary.verifyScriptPresent).toBe(true);
    expect(summary.runScriptPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, SENTRY_ALERT_FIRING_P2_36_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SENTRY_ALERT_FIRING_P2_36_RUN_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SENTRY_ALERT_FIRING_P2_36_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SENTRY_ALERT_FIRING_P2_36_NPM_SCRIPT]).toContain(
      "audit-sentry-alert-firing-p2-36.ts",
    );
    expect(pkg.scripts?.["check:sentry-alert-firing-p2-36"]).toContain(
      SENTRY_ALERT_FIRING_P2_36_UNIT_TEST,
    );
    expect(pkg.scripts?.["run:sentry-alert-firing-p2-36"]).toContain(
      "run-sentry-alert-firing-p2-36.ts",
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:sentry-alert-firing-p2-36"]).toContain(
      SENTRY_ALERT_FIRING_P2_36_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SENTRY_ALERT_FIRING_P2_36_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("sentry-alert-firing-p2-36");
  });

  it("formats audit lines", () => {
    const summary = auditSentryAlertFiringP2_36(ROOT);
    const lines = formatSentryAlertFiringP2_36AuditLines(summary);
    expect(lines.some((line) => line.includes(SENTRY_ALERT_FIRING_P2_36_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
