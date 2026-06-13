/**
 * Audit bundle analysis optimization (Blueprint P3-72).
 *
 * Usage:
 *   npm run audit:bundle-analysis-p3-72
 */
import {
  auditBundleAnalysisP3_72,
  formatBundleAnalysisP3_72AuditLines,
} from "@/lib/performance/bundle-analysis-p3-72-audit";

function main(): void {
  const summary = auditBundleAnalysisP3_72();

  console.log("");
  for (const line of formatBundleAnalysisP3_72AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Bundle analysis optimization P3-72 OK");
}

main();
