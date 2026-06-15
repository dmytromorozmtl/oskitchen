/**
 * Audit case study template PM baseline (Blueprint P3-139).
 *
 * Usage:
 *   npm run audit:case-study-template-p3-139
 */
import {
  auditCaseStudyTemplateP3_139,
  formatCaseStudyTemplateP3_139AuditLines,
} from "@/lib/pm/case-study-template-p3-139-audit";

function main(): void {
  const summary = auditCaseStudyTemplateP3_139();

  console.log("");
  for (const line of formatCaseStudyTemplateP3_139AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Case study template PM audit OK");
}

main();
