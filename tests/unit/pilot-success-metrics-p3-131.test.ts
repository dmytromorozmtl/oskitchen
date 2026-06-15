import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPilotSuccessMetrics,
  formatPilotSuccessMetricsAuditLines,
} from "@/lib/pm/pilot-success-metrics-p3-131-audit";
import {
  countPilotSuccessMetrics,
  loadPilotSuccessMetricsBaseline,
  validatePilotSuccessMetricsBaseline,
} from "@/lib/pm/pilot-success-metrics-p3-131-operations";
import {
  PILOT_SUCCESS_METRICS_CI_WORKFLOW,
  PILOT_SUCCESS_METRICS_DOC,
  PILOT_SUCCESS_METRICS_MILESTONES,
  PILOT_SUCCESS_METRICS_NPM_SCRIPT,
  PILOT_SUCCESS_METRICS_POLICY_ID,
  PILOT_SUCCESS_METRICS_UNIT_TEST,
} from "@/lib/pm/pilot-success-metrics-p3-131-policy";

const ROOT = process.cwd();

describe("Pilot success metrics (P3-131)", () => {
  it("locks policy id and three milestones", () => {
    expect(PILOT_SUCCESS_METRICS_POLICY_ID).toBe("pilot-success-metrics-p3-131-v1");
    expect(PILOT_SUCCESS_METRICS_MILESTONES).toHaveLength(3);
    expect(PILOT_SUCCESS_METRICS_MILESTONES.map((milestone) => milestone.id)).toEqual([
      "w1",
      "w4",
      "w8",
    ]);
  });

  it("validates baseline artifact with six metrics", () => {
    const baseline = loadPilotSuccessMetricsBaseline(ROOT);
    const validation = validatePilotSuccessMetricsBaseline(baseline);
    expect(validation.valid).toBe(true);
    expect(validation.metricsComplete).toBe(true);
    expect(validation.allNotCaptured).toBe(true);

    const counts = countPilotSuccessMetrics(baseline);
    expect(counts.milestoneCount).toBe(3);
    expect(counts.metricCount).toBe(6);
    expect(counts.capturedCount).toBe(0);
  });

  it("passes full pilot success metrics audit", () => {
    const summary = auditPilotSuccessMetrics(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.baselineValid).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.milestonesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, PILOT_SUCCESS_METRICS_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PILOT_SUCCESS_METRICS_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PILOT_SUCCESS_METRICS_NPM_SCRIPT]).toContain(
      "audit-pilot-success-metrics-p3-131.ts",
    );
    expect(pkg.scripts?.["test:ci:pilot-success-metrics-p3-131"]).toContain(
      PILOT_SUCCESS_METRICS_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, PILOT_SUCCESS_METRICS_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:pilot-success-metrics-p3-131");
  });

  it("formats audit lines", () => {
    const summary = auditPilotSuccessMetrics(ROOT);
    const lines = formatPilotSuccessMetricsAuditLines(summary);
    expect(lines.some((line) => line.includes(PILOT_SUCCESS_METRICS_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
