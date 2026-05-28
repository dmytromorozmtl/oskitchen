/**
 * Era 16 typecheck slice report runner.
 *
 * Runs all strict slices and writes artifacts/typecheck-slice-summary.json.
 * Does not stop at the first failure — reports every slice outcome.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  TYPECHECK_SLICE_ERA16_POLICY_ID,
  TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT,
} from "../lib/ci/typecheck-slice-era16-policy";
import { TYPECHECK_SLICES } from "../lib/ci/typecheck-slice-policy";
import {
  buildTypecheckSliceReportSummary,
  formatTypecheckSliceReportLines,
  type TypecheckSliceRunResult,
  typecheckSliceNpmScript,
} from "../lib/ci/typecheck-slice-report";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function runSlice(script: string): { exitCode: number; output: string; durationMs: number } {
  const started = Date.now();
  const result = spawnSync("npm", ["run", script], {
    encoding: "utf8",
    env: process.env,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  return {
    exitCode: result.status ?? 1,
    output,
    durationMs: Date.now() - started,
  };
}

function failureHint(output: string): string | undefined {
  const lines = output.split("\n").map((line) => line.trim()).filter(Boolean);
  const errorLine = [...lines].reverse().find((line) => /error TS\d+/.test(line));
  return errorLine?.slice(0, 240);
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 16 typecheck slice report

  (default)   Run all typecheck:slice:* scripts; write summary artifact
  --dry-run   Print planned slices without running tsc

Full CI gate remains: npm run typecheck (typecheck:full at 8GB)
`);
    process.exit(0);
  }

  const dryRun = hasFlag("--dry-run");
  const results: TypecheckSliceRunResult[] = [];

  for (const slice of TYPECHECK_SLICES) {
    const npmScript = typecheckSliceNpmScript(slice);
    if (dryRun) {
      results.push({
        id: slice.id,
        tsconfig: slice.tsconfig,
        heapMb: slice.heapMb,
        status: "SKIPPED",
        durationMs: 0,
        exitCode: null,
        npmScript,
        reason: "dry-run",
      });
      continue;
    }

    console.log(`\n[typecheck-report] Running ${npmScript}...\n`);
    const run = runSlice(npmScript);
    results.push({
      id: slice.id,
      tsconfig: slice.tsconfig,
      heapMb: slice.heapMb,
      status: run.exitCode === 0 ? "PASSED" : "FAILED",
      durationMs: run.durationMs,
      exitCode: run.exitCode,
      npmScript,
      reason: run.exitCode === 0 ? undefined : failureHint(run.output) ?? `exit ${run.exitCode}`,
    });
  }

  const summary = buildTypecheckSliceReportSummary(results);
  const artifactPath = join(process.cwd(), TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nTypecheck slice report (${TYPECHECK_SLICE_ERA16_POLICY_ID})\n`);
  for (const line of formatTypecheckSliceReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
