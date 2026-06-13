/**
 * Audit console.log sweep (Blueprint P3-71).
 *
 * Usage:
 *   npm run audit:console-log-sweep-p3-71
 */
import {
  auditConsoleLogSweepP3_71,
  formatConsoleLogSweepP3_71AuditLines,
} from "@/lib/devops/console-log-sweep-p3-71-audit";
import {
  auditConsoleLogSurface,
  writeConsoleLogSurfaceSummary,
} from "@/lib/devops/console-log-surface-audit";

function main(): void {
  const surface = auditConsoleLogSurface();
  writeConsoleLogSurfaceSummary(surface);

  const summary = auditConsoleLogSweepP3_71();

  console.log("");
  for (const line of formatConsoleLogSweepP3_71AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Console.log sweep P3-71 OK");
}

main();
