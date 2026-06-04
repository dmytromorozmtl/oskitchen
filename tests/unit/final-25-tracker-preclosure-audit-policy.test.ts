import { describe, expect, it } from "vitest";

import {
  auditFinal25TrackerPreclosure,
  FINAL_25_TRACKER_PRECLOSURE_POLICY_ID,
} from "@/lib/execution/final-25-tracker-preclosure-audit-policy";
import {
  TRACKER_PRECLOSURE_RUNNER_SCRIPT,
  TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT,
  TRACKER_PRECLOSURE_SUMMARY_ARTIFACT,
} from "@/lib/execution/tracker-preclosure-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-25 tracker preclosure audit", () => {
  it("locks FINAL-25 policy and task slot 219", () => {
    expect(FINAL_25_TRACKER_PRECLOSURE_POLICY_ID).toBe("final-25-tracker-219-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[24]?.id).toBe("FINAL-25");
    expect(FINAL_ORCHESTRATOR_PHASES[24]?.taskSlot).toBe(219);
    expect(TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT).toBe(
      "artifacts/execution-tracker-preclosure-snapshot.json",
    );
    expect(TRACKER_PRECLOSURE_SUMMARY_ARTIFACT).toBe(
      "artifacts/execution-tracker-preclosure-summary.json",
    );
    expect(TRACKER_PRECLOSURE_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-tracker-preclosure-snapshot.ts",
    );
  });

  it("passes preclosure audit when snapshot artifact is honest PASS", () => {
    const report = auditFinal25TrackerPreclosure();
    expect(report.final24Passed).toBe(true);
    expect(report.snapshotHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});
