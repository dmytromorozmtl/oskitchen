import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditExecutionLogContinuity,
  parseExecutionLogCycleNumbers,
} from "@/lib/execution/audit-execution-log-continuity";
import {
  EXECUTION_LOG_ARTIFACT,
  EXECUTION_LOG_HEADER_MARKER,
  EXECUTION_LOG_MIN_LAST_CYCLE,
} from "@/lib/execution/execution-log-policy";

const ROOT = process.cwd();

describe("execution log continuity — FINAL-24", () => {
  it("parses cycle numbers and finds FINAL-211..213 continuity", () => {
    const path = join(ROOT, EXECUTION_LOG_ARTIFACT);
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf8");
    const cycles = parseExecutionLogCycleNumbers(content);
    expect(cycles.length).toBeGreaterThan(200);
    expect(Math.max(...cycles)).toBeGreaterThanOrEqual(EXECUTION_LOG_MIN_LAST_CYCLE);

    const audit = auditExecutionLogContinuity(ROOT);
    expect(audit.hasCycle211).toBe(true);
    expect(audit.hasCycle212).toBe(true);
    expect(audit.hasCycle213).toBe(true);
    expect(audit.continuityHonest).toBe(true);
  });

  it("includes FINAL-24 header marker when continuity gate ran", () => {
    const content = readFileSync(join(ROOT, EXECUTION_LOG_ARTIFACT), "utf8");
    if (!content.includes(EXECUTION_LOG_HEADER_MARKER)) return;
    expect(content.indexOf(EXECUTION_LOG_HEADER_MARKER)).toBeLessThan(200);
  });
});
