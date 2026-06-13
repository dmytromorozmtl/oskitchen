/**
 * Audit visual QA (Blueprint P3-55).
 *
 * Usage:
 *   npm run audit:visual-qa-p3-55
 */
import {
  auditVisualQaP3_55,
  formatVisualQaP3_55AuditLines,
} from "@/lib/qa/visual-qa-p3-55-audit";

function main(): void {
  const summary = auditVisualQaP3_55();

  console.log("");
  for (const line of formatVisualQaP3_55AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Visual QA P3-55 OK");
}

main();
