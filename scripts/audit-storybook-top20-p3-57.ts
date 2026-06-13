/**
 * Audit Storybook top-20 (Blueprint P3-57).
 *
 * Usage:
 *   npm run audit:storybook-top20-p3-57
 */
import {
  auditStorybookTop20P3_57,
  formatStorybookTop20P3_57AuditLines,
} from "@/lib/qa/storybook-top20-p3-57-audit";

function main(): void {
  const summary = auditStorybookTop20P3_57();

  console.log("");
  for (const line of formatStorybookTop20P3_57AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Storybook top-20 P3-57 OK");
}

main();
