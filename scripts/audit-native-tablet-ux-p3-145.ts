/**
 * Audit native tablet UX TouchBistro baseline (Blueprint P3-145).
 *
 * Usage:
 *   npm run audit:native-tablet-ux-p3-145
 */
import {
  auditNativeTabletUxP3_145,
  formatNativeTabletUxP3_145AuditLines,
} from "@/lib/design/native-tablet-ux-p3-145-audit";

function main(): void {
  const summary = auditNativeTabletUxP3_145();

  console.log("");
  for (const line of formatNativeTabletUxP3_145AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Native tablet UX TouchBistro audit OK");
}

main();
