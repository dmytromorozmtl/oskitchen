/**
 * Typecheck slice run summary — Evolution Era 16 Cycle 11.
 *
 * Collects PASSED / FAILED results for all strict slices without stopping
 * at the first failure. Full `typecheck:full` remains the canonical CI gate.
 */

import {
  TYPECHECK_FULL_SCRIPT,
  TYPECHECK_SLICES,
  type TypecheckSliceDefinition,
  type TypecheckSliceId,
} from "@/lib/ci/typecheck-slice-policy";

export const TYPECHECK_SLICE_REPORT_VERSION = "era16-typecheck-slice-report-v1" as const;

export type TypecheckSliceRunStatus = "PASSED" | "FAILED" | "SKIPPED";

export type TypecheckSliceRunResult = {
  id: TypecheckSliceId;
  tsconfig: string;
  heapMb: number;
  status: TypecheckSliceRunStatus;
  durationMs: number;
  exitCode: number | null;
  npmScript: string;
  reason?: string;
};

export type TypecheckSliceReportOverall = "PASSED" | "FAILED" | "SKIPPED";

export type TypecheckSliceReportSummary = {
  version: typeof TYPECHECK_SLICE_REPORT_VERSION;
  runAt: string;
  overall: TypecheckSliceReportOverall;
  canonicalFullGate: typeof TYPECHECK_FULL_SCRIPT;
  sliceCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  totalDurationMs: number;
  slices: TypecheckSliceRunResult[];
};

export function typecheckSliceNpmScript(slice: TypecheckSliceDefinition): string {
  return `typecheck:slice:${slice.id}`;
}

export function resolveTypecheckSliceReportOverall(
  slices: readonly TypecheckSliceRunResult[],
): TypecheckSliceReportOverall {
  if (slices.some((slice) => slice.status === "FAILED")) return "FAILED";
  const actionable = slices.filter((slice) => slice.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((slice) => slice.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function formatTypecheckSliceRunLine(result: TypecheckSliceRunResult): string {
  const duration = `${result.durationMs}ms`;
  if (result.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${result.id} (${result.tsconfig}): ${result.reason ?? "skipped"}`;
  }
  if (result.status === "FAILED") {
    return `[FAILED] ${result.id} (${result.tsconfig}, ${duration})${result.reason ? `: ${result.reason}` : ""}`;
  }
  return `[PASSED] ${result.id} (${result.tsconfig}, ${duration})`;
}

export function buildTypecheckSliceReportSummary(
  slices: readonly TypecheckSliceRunResult[],
): TypecheckSliceReportSummary {
  const passedCount = slices.filter((slice) => slice.status === "PASSED").length;
  const failedCount = slices.filter((slice) => slice.status === "FAILED").length;
  const skippedCount = slices.filter((slice) => slice.status === "SKIPPED").length;

  return {
    version: TYPECHECK_SLICE_REPORT_VERSION,
    runAt: new Date().toISOString(),
    overall: resolveTypecheckSliceReportOverall(slices),
    canonicalFullGate: TYPECHECK_FULL_SCRIPT,
    sliceCount: slices.length,
    passedCount,
    failedCount,
    skippedCount,
    totalDurationMs: slices.reduce((sum, slice) => sum + slice.durationMs, 0),
    slices: [...slices],
  };
}

export function buildTypecheckSliceReportPlan(): TypecheckSliceRunResult[] {
  return TYPECHECK_SLICES.map((slice) => ({
    id: slice.id,
    tsconfig: slice.tsconfig,
    heapMb: slice.heapMb,
    status: "SKIPPED" as const,
    durationMs: 0,
    exitCode: null,
    npmScript: typecheckSliceNpmScript(slice),
    reason: "Report plan only — run npm run typecheck:report:slices for live tsc results",
  }));
}

export function formatTypecheckSliceReportLines(summary: TypecheckSliceReportSummary): string[] {
  return [
    `Typecheck slice report (${summary.version}) — overall: ${summary.overall}`,
    `Canonical full gate: npm run ${summary.canonicalFullGate} (8GB) — unchanged`,
    `Run at: ${summary.runAt}`,
    `Slices: ${summary.passedCount} passed, ${summary.failedCount} failed, ${summary.skippedCount} skipped (${summary.totalDurationMs}ms total)`,
    "",
    ...summary.slices.map((slice) => formatTypecheckSliceRunLine(slice)),
  ];
}
