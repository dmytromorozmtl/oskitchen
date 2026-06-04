import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  FINAL_EXECUTION_JSON_POLICY_ID,
  FINAL_EXECUTION_REPORT_ARTIFACT,
  FINAL_EXECUTION_REPORT_REQUIRED_KEYS,
} from "@/lib/execution/final-execution-json-policy";
import {
  auditFinalExecutionReportSchema,
  buildFinalExecutionReport,
} from "@/lib/execution/sync-final-execution-report";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

const ROOT = process.cwd();

describe("final execution JSON sync — FINAL-22", () => {
  it("builds honest report with tracker and orchestrator gates", () => {
    const report = buildFinalExecutionReport(ROOT);
    expect(report.version).toBe(FINAL_EXECUTION_JSON_POLICY_ID);
    expect(auditFinalExecutionReportSchema(report)).toBe(true);
    expect(report.finalOrchestratorGates).toHaveLength(FINAL_ORCHESTRATOR_PHASES.length);
    expect(report.trackerSync.totalCount).toBeGreaterThan(400);
    expect(report.honestyNote).toContain("honest");
  });

  it("synced artifact uses FINAL-22 schema when written by runner", () => {
    const path = join(ROOT, FINAL_EXECUTION_REPORT_ARTIFACT);
    const built = buildFinalExecutionReport(ROOT);
    expect(auditFinalExecutionReportSchema(built)).toBe(true);
    expect(built.ready).toBe(false);

    if (!existsSync(path)) return;

    const onDisk = JSON.parse(readFileSync(path, "utf8")) as ReturnType<
      typeof buildFinalExecutionReport
    >;
    if (onDisk.version !== FINAL_EXECUTION_JSON_POLICY_ID) return;

    for (const key of FINAL_EXECUTION_REPORT_REQUIRED_KEYS) {
      expect(onDisk, `missing ${key}`).toHaveProperty(key);
    }
    expect(onDisk.ready).toBe(false);
  });
});
