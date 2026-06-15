/**
 * Audit native tablet UX (Blueprint P2-95).
 *
 * Usage:
 *   npm run audit:native-tablet-ux-p2-95
 */
import {
  auditNativeTabletUxP2_95,
  formatNativeTabletUxP2_95AuditLines,
} from "@/lib/pos/native-tablet-ux-p2-95-audit";

function main(): void {
  const summary = auditNativeTabletUxP2_95();

  console.log("");
  for (const line of formatNativeTabletUxP2_95AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Native tablet UX (P2-95) audit OK");
}

main();
