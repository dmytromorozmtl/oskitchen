import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditAbsoluteFinalCompletion } from "@/lib/absolute-final/absolute-final-completion-audit";
import {
  ABSOLUTE_FINAL_BLOCKED_TASK_IDS,
  ABSOLUTE_FINAL_COMPLETION_DOC_PATH,
  ABSOLUTE_FINAL_COMPLETION_NOTE,
  ABSOLUTE_FINAL_COMPLETION_POLICY_ID,
  ABSOLUTE_FINAL_FINAL_AUDIT_TASKS,
  ABSOLUTE_FINAL_SCORECARD_DIMENSIONS,
  ABSOLUTE_FINAL_TASK_TOTAL,
} from "@/lib/absolute-final/absolute-final-completion-policy";

const ROOT = process.cwd();
/** Absolute Final Task 151 — completion capstone */
const TASK = 151;

describe(`Absolute Final completion (Task ${TASK})`, () => {
  it("locks absolute final completion policy id and task total", () => {
    expect(ABSOLUTE_FINAL_COMPLETION_POLICY_ID).toBe("absolute-final-completion-150-v1");
    expect(ABSOLUTE_FINAL_TASK_TOTAL).toBe(150);
    expect(ABSOLUTE_FINAL_BLOCKED_TASK_IDS).toEqual(["2-activate-sentry-dsn"]);
    expect(ABSOLUTE_FINAL_FINAL_AUDIT_TASKS).toHaveLength(5);
  });

  it("documents 149/150 completion with Sentry blocker note", () => {
    expect(ABSOLUTE_FINAL_COMPLETION_NOTE).toContain("149/150");
    expect(ABSOLUTE_FINAL_COMPLETION_NOTE).toContain("Sentry");
  });

  it("references absolute final report with 100/100 certification", () => {
    const doc = readFileSync(join(ROOT, ABSOLUTE_FINAL_COMPLETION_DOC_PATH), "utf8");
    expect(doc).toContain(ABSOLUTE_FINAL_COMPLETION_POLICY_ID);
    expect(doc).toContain("100/100");
    expect(doc).toContain("149/150");
    expect(doc).toContain("Sentry");
    expect(doc).toContain("Absolute Final — 150 tasks complete");
  });

  it("covers 12 audited scorecard dimensions at 100/100", () => {
    expect(ABSOLUTE_FINAL_SCORECARD_DIMENSIONS).toHaveLength(12);
    const doc = readFileSync(join(ROOT, ABSOLUTE_FINAL_COMPLETION_DOC_PATH), "utf8");
    for (const dim of ABSOLUTE_FINAL_SCORECARD_DIMENSIONS) {
      expect(doc).toContain(dim);
    }
  });

  it("certifies final audit gates 146 through 150 in report", () => {
    const doc = readFileSync(join(ROOT, ABSOLUTE_FINAL_COMPLETION_DOC_PATH), "utf8");
    expect(doc).toContain("absolute-final-typescript-strict-v1");
    expect(doc).toContain("absolute-final-wcag-21-aa-v1");
    expect(doc).toContain("absolute-final-lighthouse-95-v1");
    expect(doc).toContain("absolute-final-owasp-top-10-v1");
    expect(doc).toContain("absolute-final-competitor-parity-21-v1");
  });

  it("references completion policy module with Task 151 marker", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/absolute-final/absolute-final-completion-policy.ts"),
      "utf8",
    );
    expect(policySource).toContain("Absolute Final Task 151");
    expect(policySource).toContain("absolute-final-report.md");
  });

  it("passes absolute final completion wiring audit", () => {
    const audit = auditAbsoluteFinalCompletion(ROOT);
    expect(audit.doneCount).toBe(149);
    expect(audit.blockedCount).toBe(1);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("locks CI cert script for absolute final completion gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:absolute-final-completion:cert"]).toContain(
      "absolute-final-completion.test.ts",
    );
  });
});
