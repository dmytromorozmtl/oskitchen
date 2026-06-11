/**
 * Audit design token pass (colors ≥95%, no arbitrary typography/spacing).
 *
 * Usage:
 *   npm run audit:design-token-pass
 */
import {
  auditDesignTokenPass,
  formatDesignTokenPassAuditLines,
} from "@/lib/design/design-token-pass-audit";

function main(): void {
  const summary = auditDesignTokenPass();

  console.log("");
  for (const line of formatDesignTokenPassAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Design token pass audit OK");
}

main();
