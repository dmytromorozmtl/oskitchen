/**
 * Audit competitor alternative pages (Blueprint P1-80).
 *
 * Usage:
 *   npm run audit:competitor-alternative-pages
 */
import {
  auditCompetitorAlternativePages,
  formatCompetitorAlternativePagesAuditLines,
} from "@/lib/marketing/competitor-alternative-pages-audit";

function main(): void {
  const summary = auditCompetitorAlternativePages();

  console.log("");
  for (const line of formatCompetitorAlternativePagesAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Competitor alternative pages audit OK");
}

main();
