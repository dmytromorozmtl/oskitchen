/**
 * Audit POS terminal density design tokens.
 *
 * Usage:
 *   npm run audit:pos-terminal-density
 */
import {
  auditPosTerminalDensity,
  formatPosTerminalDensityAuditLines,
} from "@/lib/design/pos-terminal-density-audit";

function main(): void {
  const summary = auditPosTerminalDensity();

  console.log("");
  for (const line of formatPosTerminalDensityAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ POS terminal density audit OK");
}

main();
