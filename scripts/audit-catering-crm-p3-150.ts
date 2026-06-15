/**
 * Audit catering CRM Tripleseat baseline (Blueprint P3-150).
 *
 * Usage:
 *   npm run audit:catering-crm-p3-150
 */
import {
  auditCateringCrmP3_150,
  formatCateringCrmP3_150AuditLines,
} from "@/lib/catering/catering-crm-p3-150-audit";

function main(): void {
  const summary = auditCateringCrmP3_150();

  console.log("");
  for (const line of formatCateringCrmP3_150AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Catering CRM Tripleseat audit OK");
}

main();
