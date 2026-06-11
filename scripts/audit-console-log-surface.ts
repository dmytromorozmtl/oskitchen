/**
 * Tier A/B console.log audit + top-50 migration gate.
 *
 * Usage:
 *   npm run audit:console-log-surface
 *   npm run audit:console-log-surface -- --write
 */
import {
  auditConsoleLogSurface,
  formatConsoleLogSurfaceLines,
  writeConsoleLogSurfaceSummary,
} from "@/lib/devops/console-log-surface-audit";

function main(): void {
  const write = process.argv.includes("--write");
  const summary = auditConsoleLogSurface();

  console.log("");
  for (const line of formatConsoleLogSurfaceLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (write) {
    writeConsoleLogSurfaceSummary(summary);
    console.log(`Wrote ${summary.policyId} → artifacts/console-log-sweep-summary.json\n`);
  }

  if (!summary.passed) {
    if (summary.runtimeHits.length) {
      console.error("Runtime hits:", summary.runtimeHits.slice(0, 10).join(", "));
    }
    if (summary.top50Failures.length) {
      console.error("Top-50 failures:", summary.top50Failures.join(", "));
    }
    process.exit(1);
  }

  console.log("✓ Console.log surface audit OK");
}

main();
