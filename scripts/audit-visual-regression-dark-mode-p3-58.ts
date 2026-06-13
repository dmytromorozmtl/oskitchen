/**
 * Audit visual regression dark mode (Blueprint P3-58).
 *
 * Usage:
 *   npm run audit:visual-regression-dark-mode-p3-58
 */
import {
  auditVisualRegressionDarkModeP3_58,
  formatVisualRegressionDarkModeP3_58AuditLines,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-audit";

function main(): void {
  const summary = auditVisualRegressionDarkModeP3_58();

  console.log("");
  for (const line of formatVisualRegressionDarkModeP3_58AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Visual regression dark mode P3-58 OK");
}

main();
