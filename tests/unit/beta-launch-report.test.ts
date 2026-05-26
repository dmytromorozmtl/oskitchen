import { describe, expect, it } from "vitest";

import { buildLaunchReport } from "@/lib/beta-launch/build-report";
import type { GateResult } from "@/lib/beta-launch/types";

function gate(status: GateResult["status"]): GateResult {
  return {
    id: "t",
    step: 1,
    name: "test",
    status,
    message: "",
    durationMs: 0,
  };
}

describe("buildLaunchReport", () => {
  it("ready when all automated pass and no strict signoffs", () => {
    const report = buildLaunchReport([gate("pass"), gate("pass")]);
    expect(report.summary.readyForBeta).toBe(true);
    expect(report.summary.readinessScore).toBeGreaterThan(0);
  });

  it("not ready when fail present", () => {
    const report = buildLaunchReport([gate("pass"), gate("fail")]);
    expect(report.summary.readyForBeta).toBe(false);
  });

  it("blocks manual gates with strictSignoffs", () => {
    const report = buildLaunchReport([gate("pass"), gate("manual")], { strictSignoffs: true });
    expect(report.summary.readyForBeta).toBe(false);
    expect(report.summary.blockingManual).toBe(1);
  });

  it("allows manual without strictSignoffs if automated pass", () => {
    const report = buildLaunchReport([gate("pass"), gate("manual")]);
    expect(report.summary.readyForBeta).toBe(true);
  });
});
