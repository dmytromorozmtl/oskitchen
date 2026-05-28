import { describe, expect, it } from "vitest";

import {
  buildTypecheckSliceReportPlan,
  buildTypecheckSliceReportSummary,
  formatTypecheckSliceRunLine,
  resolveTypecheckSliceReportOverall,
  TYPECHECK_SLICE_REPORT_VERSION,
  type TypecheckSliceRunResult,
} from "@/lib/ci/typecheck-slice-report";

function sliceResult(
  partial: Partial<TypecheckSliceRunResult> & Pick<TypecheckSliceRunResult, "id" | "status">,
): TypecheckSliceRunResult {
  return {
    tsconfig: `tsconfig.slice.${partial.id}.json`,
    heapMb: 6144,
    durationMs: 100,
    exitCode: partial.status === "PASSED" ? 0 : partial.status === "FAILED" ? 1 : null,
    npmScript: `typecheck:slice:${partial.id}`,
    ...partial,
  };
}

describe("typecheck slice report", () => {
  it("locks era16 report version", () => {
    expect(TYPECHECK_SLICE_REPORT_VERSION).toBe("era16-typecheck-slice-report-v1");
  });

  it("resolves overall FAILED when any slice failed", () => {
    const overall = resolveTypecheckSliceReportOverall([
      sliceResult({ id: "services-core", status: "PASSED" }),
      sliceResult({ id: "platform-auth", status: "FAILED" }),
    ]);
    expect(overall).toBe("FAILED");
  });

  it("resolves overall PASSED when all actionable slices passed", () => {
    const overall = resolveTypecheckSliceReportOverall([
      sliceResult({ id: "services-core", status: "PASSED" }),
      sliceResult({ id: "platform-auth", status: "PASSED" }),
    ]);
    expect(overall).toBe("PASSED");
  });

  it("builds summary counts and canonical full gate marker", () => {
    const summary = buildTypecheckSliceReportSummary([
      sliceResult({ id: "services-core", status: "PASSED", durationMs: 1200 }),
      sliceResult({ id: "platform-auth", status: "FAILED", durationMs: 800, reason: "error TS2345" }),
    ]);
    expect(summary.overall).toBe("FAILED");
    expect(summary.passedCount).toBe(1);
    expect(summary.failedCount).toBe(1);
    expect(summary.totalDurationMs).toBe(2000);
    expect(summary.canonicalFullGate).toBe("typecheck:full");
  });

  it("formats PASSED and FAILED lines", () => {
    expect(
      formatTypecheckSliceRunLine(
        sliceResult({ id: "services-core", status: "PASSED", durationMs: 500 }),
      ),
    ).toContain("[PASSED] services-core");
    expect(
      formatTypecheckSliceRunLine(
        sliceResult({
          id: "platform-auth",
          status: "FAILED",
          durationMs: 500,
          reason: "error TS2345",
        }),
      ),
    ).toContain("[FAILED] platform-auth");
  });

  it("builds report plan for all registry slices", () => {
    const plan = buildTypecheckSliceReportPlan();
    expect(plan).toHaveLength(4);
    expect(plan.every((slice) => slice.status === "SKIPPED")).toBe(true);
  });
});
