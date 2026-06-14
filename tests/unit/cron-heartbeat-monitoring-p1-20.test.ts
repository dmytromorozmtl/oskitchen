import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CRON_HEARTBEAT_MONITORING_P1_20_ARTIFACT,
  CRON_HEARTBEAT_MONITORING_P1_20_CHECK_NPM_SCRIPT,
  CRON_HEARTBEAT_MONITORING_P1_20_CI_NPM_SCRIPT,
  CRON_HEARTBEAT_MONITORING_P1_20_CI_WORKFLOW,
  CRON_HEARTBEAT_MONITORING_P1_20_DOC,
  CRON_HEARTBEAT_MONITORING_P1_20_EVIDENCE_SERVICE,
  CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_ROUTE,
  CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_SERVICE,
  CRON_HEARTBEAT_MONITORING_P1_20_LOAD_FN,
  CRON_HEARTBEAT_MONITORING_P1_20_POLICY_ID,
  CRON_HEARTBEAT_MONITORING_P1_20_REPORTED_STALE_SLUGS,
  CRON_HEARTBEAT_MONITORING_P1_20_SUMMARIZE_FN,
  CRON_HEARTBEAT_MONITORING_P1_20_WIRING_PATHS,
} from "@/lib/qa/cron-heartbeat-monitoring-p1-20-policy";
import { CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS } from "@/services/cron/production-manifest";
import { summarizeCriticalCronExecutionEvidence } from "@/services/cron/cron-execution-evidence";

const ROOT = process.cwd();

describe("Production cron heartbeat monitoring (P1-20)", () => {
  it("locks P1-20 policy and monitors reported stale production crons", () => {
    expect(CRON_HEARTBEAT_MONITORING_P1_20_POLICY_ID).toBe(
      "p1-20-cron-heartbeat-monitoring-v1",
    );
    for (const slug of CRON_HEARTBEAT_MONITORING_P1_20_REPORTED_STALE_SLUGS) {
      expect(CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS).toContain(slug);
    }
    expect(CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS.length).toBeGreaterThanOrEqual(6);
  });

  it("summarizeCriticalCronExecutionEvidence returns cronExecution.ok:true when heartbeats are healthy", () => {
    const now = new Date("2026-06-14T16:00:00.000Z");
    const summary = summarizeCriticalCronExecutionEvidence(
      CRITICAL_PRODUCTION_CRON_EVIDENCE_SLUGS.map((slug) => ({
        slug,
        createdAt: new Date("2026-06-14T15:00:00.000Z"),
        updatedAt: new Date("2026-06-14T15:59:00.000Z"),
        lastStartedAt: new Date("2026-06-14T15:59:00.000Z"),
        lastSucceededAt: new Date("2026-06-14T15:59:00.000Z"),
        lastFailedAt: null,
        lastDurationMs: 900,
        lastStatusCode: 200,
        consecutiveFailures: 0,
      })),
      now,
    );

    expect(summary.ok).toBe(true);
    expect(summary.productionFailure).toBeNull();
    expect(summary.tracked.every((row) => row.status === "healthy")).toBe(true);
  });

  it("summarizeCriticalCronExecutionEvidence returns cronExecution.ok:false when a critical cron is stale", () => {
    const now = new Date("2026-06-14T16:00:00.000Z");
    const summary = summarizeCriticalCronExecutionEvidence(
      [
        {
          slug: "webhook-jobs",
          createdAt: new Date("2026-06-14T10:00:00.000Z"),
          updatedAt: new Date("2026-06-14T10:05:00.000Z"),
          lastStartedAt: new Date("2026-06-14T10:05:00.000Z"),
          lastSucceededAt: new Date("2026-06-14T10:05:00.000Z"),
          lastFailedAt: null,
          lastDurationMs: 900,
          lastStatusCode: 200,
          consecutiveFailures: 0,
        },
      ],
      now,
    );

    expect(summary.ok).toBe(false);
    expect(summary.productionFailure).toContain("webhook-jobs:stale");
    expect(summary.tracked.some((row) => row.slug === "webhook-jobs" && row.status === "stale")).toBe(
      true,
    );
  });

  it("wires cronExecution.ok through /api/health and health-check-service", () => {
    const healthRoute = readFileSync(
      join(ROOT, CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_ROUTE),
      "utf8",
    );
    expect(healthRoute).toContain("extended.cronExecution.ok");
    expect(healthRoute).toContain("cronExecution: {");
    expect(healthRoute).toContain("ok: extended.cronExecution.ok");

    const healthService = readFileSync(
      join(ROOT, CRON_HEARTBEAT_MONITORING_P1_20_HEALTH_SERVICE),
      "utf8",
    );
    expect(healthService).toContain(CRON_HEARTBEAT_MONITORING_P1_20_LOAD_FN);

    const evidenceService = readFileSync(
      join(ROOT, CRON_HEARTBEAT_MONITORING_P1_20_EVIDENCE_SERVICE),
      "utf8",
    );
    expect(evidenceService).toContain(CRON_HEARTBEAT_MONITORING_P1_20_SUMMARIZE_FN);
    expect(evidenceService).toContain("ok: bad.length === 0");
  });

  it("documents P1-20 and wires npm scripts + CI workflow", () => {
    for (const rel of CRON_HEARTBEAT_MONITORING_P1_20_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, CRON_HEARTBEAT_MONITORING_P1_20_DOC), "utf8");
    expect(doc).toContain(CRON_HEARTBEAT_MONITORING_P1_20_POLICY_ID);
    expect(doc).toContain("cronExecution.ok");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CRON_HEARTBEAT_MONITORING_P1_20_CHECK_NPM_SCRIPT]).toContain(
      "cron-heartbeat-monitoring-p1-20.test.ts",
    );
    expect(pkg.scripts?.[CRON_HEARTBEAT_MONITORING_P1_20_CI_NPM_SCRIPT]).toContain(
      "cron-heartbeat-monitoring-p1-20.test.ts",
    );

    const workflow = readFileSync(join(ROOT, CRON_HEARTBEAT_MONITORING_P1_20_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("cron-heartbeat-monitoring-p1-20");

    const artifact = JSON.parse(
      readFileSync(join(ROOT, CRON_HEARTBEAT_MONITORING_P1_20_ARTIFACT), "utf8"),
    ) as { policyId: string; healthCheckField: string; ciGate: boolean };
    expect(artifact.policyId).toBe(CRON_HEARTBEAT_MONITORING_P1_20_POLICY_ID);
    expect(artifact.healthCheckField).toBe("checks.cronExecution.ok");
    expect(artifact.ciGate).toBe(true);
  });
});
