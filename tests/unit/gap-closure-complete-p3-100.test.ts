import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditGapClosureCompleteP3100,
  formatGapClosureCompleteP3100AuditLines,
} from "@/lib/gap-closure/gap-closure-complete-p3-100-audit";
import {
  GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT,
  GAP_CLOSURE_COMPLETE_P3_100_CHECK_NPM_SCRIPT,
  GAP_CLOSURE_COMPLETE_P3_100_CI_WORKFLOW,
  GAP_CLOSURE_COMPLETE_P3_100_DOC,
  GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID,
  GAP_CLOSURE_COMPLETE_P3_100_TASK_ID,
  GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS,
  GAP_CLOSURE_COMPLETE_P3_100_UNIT_TEST,
  GAP_CLOSURE_COMPLETE_P3_100_WIRING_PATHS,
} from "@/lib/gap-closure/gap-closure-complete-p3-100-policy";

const ROOT = process.cwd();

describe("Gap closure complete (P3-100)", () => {
  it("locks 100-task completion policy", () => {
    expect(GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID).toBe("gap-closure-complete-p3-100-v1");
    expect(GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS).toBe(100);
    expect(GAP_CLOSURE_COMPLETE_P3_100_TASK_ID).toBe("p3-100-final-gap-closure");
  });

  it("passes full P3-100 gap closure complete audit", () => {
    const summary = auditGapClosureCompleteP3100(ROOT);
    expect(summary.trackerComplete, summary.failures.join("; ")).toBe(true);
    expect(summary.doneCount).toBe(100);
    expect(summary.finalTaskPresent).toBe(true);
    expect(summary.executionLogWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-100 wiring paths, CI gate, and artifact", () => {
    for (const path of GAP_CLOSURE_COMPLETE_P3_100_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[GAP_CLOSURE_COMPLETE_P3_100_CHECK_NPM_SCRIPT]).toContain(
      GAP_CLOSURE_COMPLETE_P3_100_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, GAP_CLOSURE_COMPLETE_P3_100_CI_WORKFLOW), "utf8");
    expect(ci).toContain(GAP_CLOSURE_COMPLETE_P3_100_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID);
    expect(artifact.doneTasks).toBe(100);

    const doc = readFileSync(join(ROOT, GAP_CLOSURE_COMPLETE_P3_100_DOC), "utf8");
    expect(doc).toContain(GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditGapClosureCompleteP3100(ROOT);
    const lines = formatGapClosureCompleteP3100AuditLines(summary);
    expect(lines.some((line) => line.includes(GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
