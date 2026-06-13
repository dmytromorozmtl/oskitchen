/**
 * Audit negative test suite (Blueprint P3-54).
 *
 * Usage:
 *   npm run audit:negative-test-suite-p3-54
 */
import {
  auditNegativeTestSuiteP3_54,
  formatNegativeTestSuiteP3_54AuditLines,
} from "@/lib/qa/negative-test-suite-p3-54-audit";

function main(): void {
  const summary = auditNegativeTestSuiteP3_54();

  console.log("");
  for (const line of formatNegativeTestSuiteP3_54AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Negative test suite P3-54 OK");
}

main();
