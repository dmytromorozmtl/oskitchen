/**
 * Audit café mode POS baseline (Blueprint P3-143).
 *
 * Usage:
 *   npm run audit:cafe-mode-p3-143
 */
import {
  auditCafeModeP3_143,
  formatCafeModeP3_143AuditLines,
} from "@/lib/pos/cafe-mode-p3-143-audit";

function main(): void {
  const summary = auditCafeModeP3_143();

  console.log("");
  for (const line of formatCafeModeP3_143AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Café mode POS audit OK");
}

main();
