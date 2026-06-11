/**
 * Audit demo page improvement (Blueprint P1-83).
 *
 * Usage:
 *   npm run audit:demo-page-improvement
 */
import {
  auditDemoPageImprovement,
  formatDemoPageImprovementAuditLines,
} from "@/lib/marketing/demo-page-improvement-audit";

function main(): void {
  const summary = auditDemoPageImprovement();

  console.log("");
  for (const line of formatDemoPageImprovementAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Demo page improvement audit OK");
}

main();
