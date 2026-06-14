import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPenTestSchedulingP381,
  formatPenTestSchedulingP381AuditLines,
} from "@/lib/security/pen-test-scheduling-p3-81-audit";
import {
  PEN_TEST_SCHEDULING_P3_81_ARTIFACT,
  PEN_TEST_SCHEDULING_P3_81_CHECK_NPM_SCRIPT,
  PEN_TEST_SCHEDULING_P3_81_CI_WORKFLOW,
  PEN_TEST_SCHEDULING_P3_81_DOC,
  PEN_TEST_SCHEDULING_P3_81_POLICY_ID,
  PEN_TEST_SCHEDULING_P3_81_PRIMARY_VENDOR,
  PEN_TEST_SCHEDULING_P3_81_TARGET_KICKOFF,
  PEN_TEST_SCHEDULING_P3_81_UNIT_TEST,
  PEN_TEST_SCHEDULING_P3_81_WIRING_PATHS,
} from "@/lib/security/pen-test-scheduling-p3-81-policy";
import { runPenTestSchedulingBenchmarkP381 } from "@/lib/security/pen-test-scheduling-p3-81-scoring";

const ROOT = process.cwd();

describe("Pen test scheduling (P3-81)", () => {
  it("locks P3-81 policy and Cobalt primary vendor", () => {
    expect(PEN_TEST_SCHEDULING_P3_81_POLICY_ID).toBe("pen-test-scheduling-p3-81-v1");
    expect(PEN_TEST_SCHEDULING_P3_81_PRIMARY_VENDOR).toBe("cobalt");
    expect(PEN_TEST_SCHEDULING_P3_81_TARGET_KICKOFF).toBe("2026-07-07");
  });

  it("passes pen test scheduling benchmark", () => {
    const benchmark = runPenTestSchedulingBenchmarkP381({
      schedulingDocComplete: true,
      artifactScheduled: true,
      vendorSelected: true,
      qsaTrackScheduled: true,
      enterpriseGatesDefined: true,
      upstreamDocsPresent: true,
    });
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-81 pen test scheduling audit", () => {
    const summary = auditPenTestSchedulingP381(ROOT);
    expect(summary.artifactScheduled).toBe(true);
    expect(summary.vendorSelected).toBe(true);
    expect(summary.qsaTrackScheduled).toBe(true);
    expect(summary.enterpriseGatesDefined).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-81 wiring paths, CI gate, and artifacts", () => {
    for (const path of PEN_TEST_SCHEDULING_P3_81_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PEN_TEST_SCHEDULING_P3_81_CHECK_NPM_SCRIPT]).toContain(
      PEN_TEST_SCHEDULING_P3_81_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, PEN_TEST_SCHEDULING_P3_81_CI_WORKFLOW), "utf8");
    expect(ci).toContain(PEN_TEST_SCHEDULING_P3_81_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, PEN_TEST_SCHEDULING_P3_81_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(PEN_TEST_SCHEDULING_P3_81_POLICY_ID);
    expect(artifact.schedulingStatus).toBe("SCHEDULED");

    const doc = readFileSync(join(ROOT, PEN_TEST_SCHEDULING_P3_81_DOC), "utf8");
    expect(doc).toContain(PEN_TEST_SCHEDULING_P3_81_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditPenTestSchedulingP381(ROOT);
    const lines = formatPenTestSchedulingP381AuditLines(summary);
    expect(lines.some((line) => line.includes(PEN_TEST_SCHEDULING_P3_81_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
