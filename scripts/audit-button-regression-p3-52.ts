/**
 * Audit 30 critical pages button regression (Blueprint P3-52).
 *
 * Usage:
 *   npm run audit:button-regression-p3-52
 */
import {
  auditButtonRegressionP3_52,
  formatButtonRegressionP3_52AuditLines,
} from "@/lib/qa/button-regression-p3-52-audit";

function main(): void {
  const summary = auditButtonRegressionP3_52();

  console.log("");
  for (const line of formatButtonRegressionP3_52AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Button regression P3-52 OK");
}

main();
