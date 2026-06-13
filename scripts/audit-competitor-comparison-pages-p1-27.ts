/**
 * Audit P1-27 competitor comparison pages (Toast, Square, Lightspeed).
 *
 * Usage:
 *   npm run audit:competitor-comparison-pages
 */
import {
  auditCompetitorComparisonPagesP127,
  formatCompetitorComparisonPagesP127AuditLines,
} from "@/lib/marketing/competitor-comparison-pages-p1-27-audit";

function main(): void {
  const summary = auditCompetitorComparisonPagesP127();

  console.log("");
  for (const line of formatCompetitorComparisonPagesP127AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Competitor comparison pages audit OK");
}

main();
