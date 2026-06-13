/**
 * Audit case study template (Blueprint P2-50).
 *
 * Usage:
 *   npm run audit:case-study-template-p2-50
 */
import {
  auditCaseStudyTemplateP2_50,
  formatCaseStudyTemplateP2_50AuditLines,
} from "@/lib/marketing/case-study-template-p2-50-audit";

function main(): void {
  const summary = auditCaseStudyTemplateP2_50();

  console.log("");
  for (const line of formatCaseStudyTemplateP2_50AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Case study template P2-50 OK");
}

main();
