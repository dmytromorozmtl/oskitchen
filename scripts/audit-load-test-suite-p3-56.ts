/**
 * Audit load test suite (Blueprint P3-56).
 *
 * Usage:
 *   npm run audit:load-test-suite-p3-56
 */
import {
  auditLoadTestSuiteP3_56,
  formatLoadTestSuiteP3_56AuditLines,
} from "@/lib/qa/load-test-suite-p3-56-audit";

function main(): void {
  const summary = auditLoadTestSuiteP3_56();

  console.log("");
  for (const line of formatLoadTestSuiteP3_56AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Load test suite P3-56 OK");
}

main();
